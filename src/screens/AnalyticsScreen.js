import React, {useCallback, useEffect} from 'react';
import {View, ScrollView, RefreshControl} from 'react-native';

import {
  AppBar,
  AppText,
  Chips,
  DeptChart,
  ErrorState,
  ListSkeleton,
  PhaseChart,
  Screen,
  SectionHead,
  TrendChart,
} from '../components';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
  fetchAnalytics,
  setAnalyticsPeriod,
  selectAnalytics,
  selectScopeKey,
} from '../store/slices/dashboardSlice';
import {fmtDuration} from '../utils/format';
import {colors, ScaledSheet} from '../theme';

/**
 * Unlike Shift Reports this carries a 90-day option — a quarter of trend points
 * is exactly what the chart is for.
 */
const PERIODS = [
  {key: 'daily', label: 'Today'},
  {key: 'weekly', label: '7 days'},
  {key: 'monthly', label: '30 days'},
  {key: 'quarterly', label: '90 days'},
];

const AnalyticsScreen = ({navigation}) => {
  const dispatch = useAppDispatch();

  const analytics = useAppSelector(selectAnalytics);
  const scopeKey = useAppSelector(selectScopeKey);

  const {kpis, trend, phases, departments, period, status, error} = analytics;

  // Refetch on period change and whenever the branch/dataset scope moves.
  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch, period, scopeKey]);

  const onRefresh = useCallback(() => {
    dispatch(fetchAnalytics({refresh: true}));
  }, [dispatch]);

  const firstLoad = status === 'loading' && !kpis;

  const header = (
    <>
      <AppBar
        eyebrow={
          analytics.from && analytics.to && analytics.from !== analytics.to
            ? `${analytics.from} → ${analytics.to}`
            : analytics.from ?? 'Charts'
        }
        title="ANALYTICS"
        onBack={() => navigation.goBack()}
      />

      <Chips
        items={PERIODS}
        value={period}
        onChange={key => dispatch(setAnalyticsPeriod(key))}
      />
    </>
  );

  if (status === 'failed' && !kpis) {
    return (
      <Screen backgroundColor={colors.paper} statusBarColor={colors.white}>
        {header}
        <ErrorState message={error} onRetry={onRefresh} />
      </Screen>
    );
  }

  return (
    <Screen backgroundColor={colors.paper} statusBarColor={colors.white}>
      {header}

      {firstLoad ? (
        <ListSkeleton rows={4} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={analytics.refreshing}
              onRefresh={onRefresh}
              colors={[colors.tealDeep]}
              tintColor={colors.tealDeep}
            />
          }>
          {/* Headline numbers the charts below are read against. */}
          <View style={styles.stats}>
            <Stat label="COMPLIANCE" value={`${kpis?.compliance_pct ?? 0}%`} />
            <Stat
              label="AVG TAT"
              value={kpis?.avg_hours !== null && kpis?.avg_hours !== undefined
                ? fmtDuration(kpis.avg_hours * 60)
                : '—'}
            />
            <Stat label="BREACHES" value={kpis?.breaches ?? 0} tone={colors.crit} />
          </View>

          <View style={styles.stats}>
            <Stat label="SAMPLES" value={kpis?.total ?? 0} />
            <Stat
              label="P50"
              value={kpis?.p50 !== null && kpis?.p50 !== undefined ? `${kpis.p50}h` : '—'}
            />
            <Stat
              label="P95"
              value={kpis?.p95 !== null && kpis?.p95 !== undefined ? `${kpis.p95}h` : '—'}
            />
          </View>

          <SectionHead label="DAILY TAT TREND" />
          <View style={styles.card}>
            <TrendChart data={trend} />
          </View>

          <SectionHead label="WHERE THE TIME GOES" />
          <View style={styles.card}>
            <PhaseChart data={phases} />
          </View>

          <SectionHead label="BY DEPARTMENT" />
          <View style={styles.card}>
            <DeptChart data={departments} />
          </View>
        </ScrollView>
      )}
    </Screen>
  );
};

const Stat = ({label, value, tone}) => (
  <View style={styles.stat}>
    <AppText variant="mono" size={9} tracking={0.6} uppercase color={colors.ink4}>
      {label}
    </AppText>
    <AppText variant="display" size={19} tracking={0.6} color={tone} style={styles.statValue}>
      {value}
    </AppText>
  </View>
);

const styles = ScaledSheet.create({
  content: {
    paddingHorizontal: '16@s',
    paddingTop: '14@vs',
    // Generous tail so the last chart clears the gesture bar and doesn't sit
    // flush against the bottom edge when scrolled all the way down.
    paddingBottom: '56@vs',
  },
  stats: {flexDirection: 'row', gap: '10@s', marginBottom: '10@vs'},
  stat: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: '1@ms',
    borderColor: colors.line,
    borderRadius: '12@ms',
    paddingHorizontal: '12@s',
    paddingVertical: '11@vs',
  },
  statValue: {marginTop: '3@vs'},
  card: {
    backgroundColor: colors.white,
    borderWidth: '1@ms',
    borderColor: colors.line,
    borderRadius: '14@ms',
    paddingHorizontal: '14@s',
    paddingVertical: '14@vs',
  },
});

export default AnalyticsScreen;
