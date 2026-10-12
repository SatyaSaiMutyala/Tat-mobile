import React, {useState} from 'react';
import {View} from 'react-native';
import Svg, {Rect} from 'react-native-svg';

import AppText from './AppText';
import {fmtDuration} from '../utils/format';
import {colors, vs, ScaledSheet} from '../theme';

const BAR_HEIGHT = vs(8);

/** Compliance banding, matching the SLA catalogue's colours. */
const toneFor = pct =>
  pct >= 90 ? colors.ok : pct >= 75 ? colors.warn : colors.crit;

/**
 * Departments ranked by volume, each with a compliance bar and its average TAT.
 *
 *   <DeptChart data={analytics.departments} limit={8} />
 *
 * The bar is compliance %, not volume — volume is already the sort order, and
 * compliance is the number that decides whether a department needs attention.
 */
const DeptChart = ({data = [], limit = 8}) => {
  const [width, setWidth] = useState(0);

  const rows = [...data]
    .filter(Boolean)
    .sort((a, b) => (b.total ?? 0) - (a.total ?? 0))
    .slice(0, limit);

  if (rows.length === 0) {
    return (
      <AppText size={12} color={colors.ink3}>
        No departments hold samples in this window.
      </AppText>
    );
  }

  return (
    <View onLayout={e => setWidth(e.nativeEvent.layout.width)}>
      {rows.map(dept => {
        const pct = dept.compliance_pct ?? 0;
        const tone = toneFor(pct);

        return (
          <View key={dept.name} style={styles.row}>
            <View style={styles.head}>
              <AppText size={12} weight="bold" numberOfLines={1} style={styles.name}>
                {dept.name}
              </AppText>
              <AppText variant="mono" size={10.5} weight="bold" color={tone}>
                {pct}%
              </AppText>
            </View>

            {width > 0 ? (
              <Svg width={width} height={BAR_HEIGHT}>
                <Rect
                  x={0}
                  y={0}
                  width={width}
                  height={BAR_HEIGHT}
                  rx={BAR_HEIGHT / 2}
                  fill={colors.line2}
                />
                <Rect
                  x={0}
                  y={0}
                  // Always leave a sliver visible so 0% still reads as a bar.
                  width={Math.max((pct / 100) * width, 2)}
                  height={BAR_HEIGHT}
                  rx={BAR_HEIGHT / 2}
                  fill={tone}
                />
              </Svg>
            ) : null}

            <AppText variant="mono" size={9.5} tracking={0.3} uppercase color={colors.ink4} style={styles.meta}>
              {dept.total} samples · {dept.pending} pending · avg{' '}
              {dept.avg_tat !== null && dept.avg_tat !== undefined
                ? fmtDuration(dept.avg_tat * 60)
                : '—'}
            </AppText>
          </View>
        );
      })}
    </View>
  );
};

const styles = ScaledSheet.create({
  row: {marginBottom: '14@vs'},
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@s',
    marginBottom: '6@vs',
  },
  name: {flex: 1, minWidth: 0},
  meta: {marginTop: '5@vs'},
});

export default DeptChart;
