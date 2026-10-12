import React from 'react';
import {View} from 'react-native';

import {ShimmerCard, ShimmerLine} from './Shimmer';
import {ScaledSheet} from '../theme';

const URGENT_ROWS = [0, 1, 2];

/**
 * Placeholder for the Home screen. Mirrors the real layout — hero, metric
 * pair, section head, urgent rows — so nothing jumps when the data lands.
 */
const HomeSkeleton = () => (
  <View style={styles.wrap}>
    <ShimmerCard height={168} radius={20} />

    <View style={styles.metrics}>
      <ShimmerCard height={104} style={styles.metric} />
      <ShimmerCard height={104} style={styles.metric} />
    </View>

    <View style={styles.sectionHead}>
      <ShimmerLine width="34%" height={10} />
      <ShimmerLine width="18%" height={10} />
    </View>

    {URGENT_ROWS.map(row => (
      <ShimmerCard key={`urgent-${row}`} style={styles.row}>
        <View style={styles.rowInner}>
          <View style={styles.rowLeft}>
            <ShimmerLine width="45%" height={11} />
            <ShimmerLine width="62%" height={13} style={styles.gap} />
            <ShimmerLine width="80%" height={9} style={styles.gap} />
          </View>
          <View style={styles.rowRight}>
            <ShimmerLine width="100%" height={12} />
            <ShimmerLine width="60%" height={8} style={styles.gapSm} />
          </View>
        </View>
      </ShimmerCard>
    ))}
  </View>
);

const styles = ScaledSheet.create({
  wrap: {paddingHorizontal: '16@s', paddingTop: '14@vs'},
  metrics: {flexDirection: 'row', gap: '10@s', marginTop: '14@vs'},
  metric: {flex: 1},
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '22@vs',
    marginBottom: '12@vs',
    marginHorizontal: '4@s',
  },
  row: {marginBottom: '8@vs'},
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12@s',
    paddingHorizontal: '14@s',
    paddingVertical: '14@vs',
  },
  rowLeft: {flex: 1},
  rowRight: {width: '72@s', alignItems: 'flex-end'},
  gap: {marginTop: '7@vs'},
  gapSm: {marginTop: '5@vs'},
});

export default HomeSkeleton;
