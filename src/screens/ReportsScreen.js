import React, {useCallback, useEffect, useMemo} from 'react';
import {View, ScrollView, RefreshControl} from 'react-native';

import {
  AccentBar,
  AppBar,
  AppText,
  Chips,
  EmptyState,
  ErrorState,
  ListSkeleton,
  Screen,
  SectionHead,
} from '../components';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
  fetchReports,
  selectReports,
  selectScopeKey,
  setReportPeriod,
} from '../store/slices/dashboardSlice';
import {colors, ScaledSheet} from '../theme';

const PERIODS = [
  {key: 'daily', label: 'Today'},
  {key: 'weekly', label: '7 days'},
  {key: 'monthly', label: '30 days'},
];

/** Compliance class -> colour, matching the SLA catalogue. */
const TONE = {
  ok: colors.ok,
  warn: colors.warn,
  crit: colors.crit,
  mute: colors.ink4,
};

const pct = value =>
  value === null || value === undefined ? '—' : `${value}%`;

const hrs = value =>
  value === null || value === undefined ? '—' : `${value}h`;

const ReportsScreen = ({navigation}) => {
  const dispatch = useAppDispatch();
  const reports = useAppSelector(selectReports);
  const scopeKey = useAppSelector(selectScopeKey);

  // Refetch on period change and whenever the branch/department/dataset
  // scope moves underneath us.
  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch, reports.period, scopeKey]);

  const onRefresh = useCallback(
    () => dispatch(fetchReports({refresh: true})),
    [dispatch],
  );

  const {kpis, trend, shifts, departments} = reports;

  // Only days with samples are worth a row — a 30-day window is mostly zeros.
  const activeTrend = useMemo(
    () => trend.filter(d => d.total > 0),
    [trend],
  );

  const peak = useMemo(
    () => activeTrend.reduce((max, d) => Math.max(max, d.total), 0),
    [activeTrend],
  );

  const firstLoad = reports.status === 'loading' && !kpis;

  if (reports.status === 'failed' && !kpis) {
    return (
      <Screen statusBarColor={colors.white}>
        <AppBar
          eyebrow="Rollups"
          title="SHIFT REPORTS"
          onBack={() => navigation.goBack()}
        />
        <ErrorState message={reports.error} onRetry={onRefresh} />
      </Screen>
    );
  }

  return (
    <Screen backgroundColor={colors.paper} statusBarColor={colors.white}>
      <AppBar
        eyebrow={
          reports.from && reports.to && reports.from !== reports.to
            ? `${reports.from} → ${reports.to}`
            : reports.from ?? 'Rollups'
        }
        title="SHIFT REPORTS"
        onBack={() => navigation.goBack()}
      />

      <Chips
        items={PERIODS}
        value={reports.period}
        onChange={key => dispatch(setReportPeriod(key))}
      />

      {firstLoad ? (
        <ListSkeleton rows={4} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={reports.refreshing}
              onRefresh={onRefresh}
              colors={[colors.tealDeep]}
              tintColor={colors.tealDeep}
            />
          }>
          {!kpis || kpis.total === 0 ? (
            <EmptyState
              tone="muted"
              icon="bar-chart-2"
              title="NO SAMPLES"
              message={'Nothing was registered in this window.'}
            />
          ) : (
            <>
              <View style={styles.kpiGrid}>
                <Kpi label="Registered" value={kpis.total} />
                <Kpi label="Released" value={kpis.approved} />
                <Kpi label="Pending" value={kpis.pending} />
                <Kpi
                  label="On time"
                  value={kpis.on_time}
                  tone={colors.ok}
                />
                <Kpi label="Breached" value={kpis.overdue} tone={colors.crit} />
                <Kpi
                  label="Compliance"
                  value={pct(kpis.compliance_pct)}
                  tone={
                    kpis.compliance_pct >= 95
                      ? colors.ok
                      : kpis.compliance_pct >= 85
                      ? colors.warn
                      : colors.crit
                  }
                />
              </View>

              <View style={styles.tatRow}>
                <Stat label="Avg TAT" value={hrs(kpis.avg_hours)} />
                <Stat label="P50" value={hrs(kpis.p50)} />
                <Stat label="P95" value={hrs(kpis.p95)} />
              </View>

              {shifts.length ? (
                <>
                  <SectionHead label="BY SHIFT" style={styles.sectionHead} />
                  <AppText size={11} color={colors.ink3} style={styles.basisNote}>
                    Split by{' '}
                    {reports.shiftBasis === 'approved_at'
                      ? 'release time'
                      : 'registration time'}
                    .
                  </AppText>
                  {shifts.map(s => (
                    <ShiftRow key={s.key} shift={s} />
                  ))}
                </>
              ) : null}

              {activeTrend.length > 1 ? (
                <>
                  <SectionHead label="BY DAY" style={styles.sectionHead} />
                  <View style={styles.card}>
                    {activeTrend.map(day => (
                      <TrendRow key={day.date} day={day} peak={peak} />
                    ))}
                  </View>
                </>
              ) : null}

              {departments.length ? (
                <>
                  <SectionHead
                    label="BY DEPARTMENT"
                    style={styles.sectionHead}
                  />
                  {departments.map(d => (
                    <DeptRow key={d.name} dept={d} />
                  ))}
                </>
              ) : null}
            </>
          )}
        </ScrollView>
      )}
    </Screen>
  );
};

const Kpi = ({label, value, tone}) => (
  <View style={styles.kpi}>
    <AppText variant="display" size={20} tracking={0.5} color={tone}>
      {value}
    </AppText>
    <AppText
      variant="mono"
      size={9}
      tracking={0.8}
      uppercase
      color={colors.ink3}
      style={styles.kpiLabel}>
      {label}
    </AppText>
  </View>
);

const Stat = ({label, value}) => (
  <View style={styles.stat}>
    <AppText variant="mono" size={9} tracking={0.8} uppercase color={colors.ink3}>
      {label}
    </AppText>
    <AppText size={14} weight="bold" style={styles.statValue}>
      {value}
    </AppText>
  </View>
);

/** One day, with a proportional bar so volume reads at a glance. */
const TrendRow = ({day, peak}) => (
  <View style={styles.trendRow}>
    <AppText variant="mono" size={10} color={colors.ink3} style={styles.trendDate}>
      {day.label}
    </AppText>

    <View style={styles.barTrack}>
      <View
        style={[
          styles.barFill,
          {width: `${peak ? (day.total / peak) * 100 : 0}%`},
        ]}
      />
    </View>

    <AppText variant="mono" size={10.5} weight="bold" style={styles.trendTotal}>
      {day.total}
    </AppText>
    <AppText
      variant="mono"
      size={10}
      color={day.breaches > 0 ? colors.crit : colors.ink4}
      style={styles.trendBreach}>
      {day.breaches > 0 ? `−${day.breaches}` : '·'}
    </AppText>
  </View>
);

/** One shift. `mute` means nothing was released, so compliance is unjudgeable. */
const ShiftRow = ({shift}) => {
  const tone = TONE[shift.cls] || colors.ink4;
  const idle = shift.total === 0;

  return (
    <View style={styles.deptCard}>
      <AccentBar color={idle ? colors.line : tone} />

      <View style={styles.deptInner}>
        <View style={styles.deptHead}>
          <AppText size={13} weight="bold" numberOfLines={1} style={styles.deptName}>
            {shift.label}
          </AppText>
          <AppText variant="mono" size={10} color={colors.ink3}>
            {shift.window}
          </AppText>
          <AppText
            variant="mono"
            size={11.5}
            weight="extraBold"
            color={shift.cls === 'mute' ? colors.ink4 : tone}>
            {shift.cls === 'mute' ? '—' : pct(shift.compliance_pct)}
          </AppText>
        </View>

        <AppText variant="mono" size={10} color={colors.ink3} style={styles.deptMeta}>
          {idle
            ? 'No samples in this shift'
            : `${shift.total} samples · ${shift.pending} pending · ${shift.breaches} breached${
                shift.avg_tat !== null ? ` · avg ${shift.avg_tat}h` : ''
              }`}
        </AppText>
      </View>
    </View>
  );
};

const DeptRow = ({dept}) => (
  <View style={styles.deptCard}>
    <AccentBar color={TONE[dept.cls] || colors.ink4} />

    <View style={styles.deptInner}>
      <View style={styles.deptHead}>
        <AppText size={13} weight="bold" numberOfLines={1} style={styles.deptName}>
          {dept.name}
        </AppText>
        <AppText
          variant="mono"
          size={11.5}
          weight="extraBold"
          color={TONE[dept.cls] || colors.ink4}>
          {pct(dept.compliance_pct)}
        </AppText>
      </View>

      <AppText variant="mono" size={10} color={colors.ink3} style={styles.deptMeta}>
        {dept.total} samples · {dept.pending} pending · {dept.breaches} breached
        {dept.avg_tat !== null ? ` · avg ${dept.avg_tat}h` : ''}
      </AppText>
    </View>
  </View>
);

const styles = ScaledSheet.create({
  content: {paddingHorizontal: '14@s', paddingTop: '10@vs', paddingBottom: '28@vs'},
  sectionHead: {marginTop: '18@vs', marginBottom: '8@vs'},
  basisNote: {marginBottom: '8@vs', marginHorizontal: '2@s'},
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.white,
    borderWidth: '1@ms',
    borderColor: colors.line,
    borderRadius: '14@ms',
    paddingVertical: '6@vs',
  },
  kpi: {width: '33.33%', alignItems: 'center', paddingVertical: '12@vs'},
  kpiLabel: {marginTop: '3@vs'},
  tatRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderWidth: '1@ms',
    borderColor: colors.line,
    borderRadius: '14@ms',
    paddingVertical: '12@vs',
    marginTop: '10@vs',
  },
  stat: {flex: 1, alignItems: 'center'},
  statValue: {marginTop: '3@vs'},
  card: {
    backgroundColor: colors.white,
    borderWidth: '1@ms',
    borderColor: colors.line,
    borderRadius: '14@ms',
    paddingHorizontal: '12@s',
    paddingVertical: '6@vs',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@s',
    paddingVertical: '7@vs',
  },
  trendDate: {width: '46@s'},
  barTrack: {
    flex: 1,
    height: '6@vs',
    borderRadius: '3@ms',
    backgroundColor: colors.paper2,
    overflow: 'hidden',
  },
  barFill: {height: '100%', backgroundColor: colors.teal},
  trendTotal: {width: '26@s', textAlign: 'right'},
  trendBreach: {width: '26@s', textAlign: 'right'},
  deptCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderWidth: '1@ms',
    borderColor: colors.line,
    borderRadius: '12@ms',
    overflow: 'hidden',
    marginBottom: '8@vs',
  },
  deptInner: {flex: 1, paddingHorizontal: '12@s', paddingVertical: '11@vs'},
  deptHead: {flexDirection: 'row', alignItems: 'center', gap: '10@s'},
  deptName: {flex: 1, minWidth: 0},
  deptMeta: {marginTop: '4@vs'},
});

export default ReportsScreen;
