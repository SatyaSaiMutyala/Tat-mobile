import React from 'react';
import {View} from 'react-native';

import AppText from './AppText';
import AccentBar from './AccentBar';
import {colors, ScaledSheet} from '../theme';

/** Server-supplied class -> colour. `mute` means not enough data to judge. */
const TONE = {
  ok: colors.ok,
  warn: colors.warn,
  crit: colors.crit,
  mute: colors.ink4,
};

const hrs = value => (value === null || value === undefined ? '—' : `${value}h`);

/**
 * One test in the SLA matrix: promised Std TAT against achieved percentiles,
 * with the P95/SLA ratio as the headline judgement.
 */
const SlaRow = ({item}) => {
  const tone = TONE[item.sla_cls] || TONE.mute;
  const hasData = item.p95 !== null && item.p95 !== undefined;

  return (
    <View style={styles.card}>
      <AccentBar color={tone} />

      <View style={styles.inner}>
        <View style={styles.top}>
          <View style={styles.identity}>
            <AppText variant="mono" size={11} weight="bold" color={colors.ink3} tracking={0.3}>
              {item.code}
            </AppText>
            <AppText size={13.5} weight="bold" numberOfLines={1} style={styles.name}>
              {item.name}
            </AppText>
            <AppText variant="mono" size={9.5} tracking={0.3} numberOfLines={1} style={styles.dept}>
              {item.dept || '—'} · {item.total} sample{item.total === 1 ? '' : 's'}
            </AppText>
          </View>

          <View style={styles.ratioBox}>
            <AppText variant="display" size={17} tracking={0.4} color={tone} align="right">
              {item.sla_ratio !== null && item.sla_ratio !== undefined
                ? `${item.sla_ratio}×`
                : '—'}
            </AppText>
            <AppText variant="mono" size={8} tracking={0.5} uppercase align="right" style={styles.ratioLabel}>
              P95 / SLA
            </AppText>
          </View>
        </View>

        <View style={styles.metrics}>
          <Metric label="SLA" value={hrs(item.std_tat)} />
          <Metric label="P50" value={hasData ? hrs(item.p50) : '—'} />
          <Metric label="P95" value={hasData ? hrs(item.p95) : '—'} />
          <Metric
            label="Compliance"
            value={`${item.compliance_pct ?? 0}%`}
            color={item.cls ? TONE[item.cls] : undefined}
          />
        </View>
      </View>
    </View>
  );
};

const Metric = ({label, value, color}) => (
  <View style={styles.metric}>
    <AppText variant="mono" size={8.5} tracking={0.6} uppercase>
      {label}
    </AppText>
    <AppText size={12.5} weight="extraBold" color={color || colors.ink} style={styles.metricValue}>
      {value}
    </AppText>
  </View>
);

const styles = ScaledSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: '1@ms',
    borderColor: colors.line,
    borderRadius: '14@ms',
    overflow: 'hidden',
    marginBottom: '8@vs',
  },
  inner: {paddingLeft: '18@s', paddingRight: '14@s', paddingVertical: '12@vs'},
  top: {flexDirection: 'row', alignItems: 'flex-start', gap: '12@s'},
  identity: {flex: 1, minWidth: 0},
  name: {marginTop: '2@vs', lineHeight: '16@ms'},
  dept: {marginTop: '3@vs'},
  ratioBox: {alignItems: 'flex-end'},
  ratioLabel: {marginTop: '1@vs'},
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '10@vs',
    paddingTop: '10@vs',
    borderTopWidth: '1@ms',
    borderTopColor: colors.line,
    borderStyle: 'dashed',
  },
  metric: {flex: 1},
  metricValue: {marginTop: '3@vs'},
});

export default React.memo(SlaRow);
