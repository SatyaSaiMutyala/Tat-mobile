import React, {useState} from 'react';
import {View} from 'react-native';
import Svg, {Rect} from 'react-native-svg';

import AppText from './AppText';
import {fmtDuration} from '../utils/format';
import {colors, vs, ms, ScaledSheet} from '../theme';

const BAR_HEIGHT = vs(22);

/**
 * Where the turnaround actually goes: one stacked bar splitting average TAT
 * across the six workflow phases, then a row per phase with its hours.
 *
 *   <PhaseChart data={analytics.phases} />
 *
 * Each phase carries its own colour from the API, so the bar and the rows below
 * match the web dashboard's phase palette without redefining it here.
 */
const PhaseChart = ({data = []}) => {
  const [width, setWidth] = useState(0);

  const phases = data.filter(p => (p?.avg_hours ?? 0) > 0);
  const totalHours = phases.reduce((sum, p) => sum + p.avg_hours, 0);

  if (phases.length === 0) {
    return (
      <AppText size={12} color={colors.ink3}>
        No completed samples in this window, so there are no phase timings yet.
      </AppText>
    );
  }

  // Widths come off the real hours rather than the API's rounded `share`, so
  // the segments always add up to exactly the bar.
  let offset = 0;
  const segments = phases.map(p => {
    const w = (p.avg_hours / totalHours) * width;
    const seg = {key: p.key, x: offset, width: w, color: p.color};
    offset += w;
    return seg;
  });

  return (
    <View>
      <View style={styles.canvas} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 ? (
          <Svg width={width} height={BAR_HEIGHT}>
            {segments.map(seg => (
              <Rect
                key={seg.key}
                x={seg.x}
                y={0}
                width={Math.max(seg.width, 1)}
                height={BAR_HEIGHT}
                fill={seg.color}
              />
            ))}
          </Svg>
        ) : null}
      </View>

      <AppText variant="mono" size={9.5} tracking={0.4} uppercase color={colors.ink4} style={styles.total}>
        Average total {fmtDuration(totalHours * 60)} across {phases.length} phases
      </AppText>

      {phases.map(phase => (
        <View key={phase.key} style={styles.row}>
          <View style={[styles.swatch, {backgroundColor: phase.color}]} />
          <AppText size={12} numberOfLines={1} style={styles.name}>
            {phase.name}
          </AppText>
          <AppText variant="mono" size={11} weight="bold" style={styles.hours}>
            {fmtDuration(phase.avg_hours * 60)}
          </AppText>
          <AppText variant="mono" size={10} color={colors.ink4} style={styles.share}>
            {phase.share}%
          </AppText>
        </View>
      ))}
    </View>
  );
};

const styles = ScaledSheet.create({
  canvas: {
    height: BAR_HEIGHT,
    width: '100%',
    borderRadius: '6@ms',
    overflow: 'hidden',
  },
  total: {marginTop: '8@vs', marginBottom: '4@vs'},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@s',
    paddingVertical: '7@vs',
    borderBottomWidth: ms(1),
    borderBottomColor: colors.line2,
  },
  swatch: {width: '8@ms', height: '8@ms', borderRadius: '2@ms'},
  name: {flex: 1, minWidth: 0},
  hours: {width: '58@s', textAlign: 'right'},
  share: {width: '38@s', textAlign: 'right'},
});

export default PhaseChart;
