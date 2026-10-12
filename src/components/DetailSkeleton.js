import React from 'react';
import {View} from 'react-native';

import {ShimmerCard, ShimmerCircle, ShimmerLine} from './Shimmer';
import {colors, ScaledSheet} from '../theme';

const PHASES = [0, 1, 2, 3, 4, 5];

/**
 * Placeholder for the sample detail screen: identity block, status card and
 * the six-phase timeline.
 */
const DetailSkeleton = () => (
  <View style={styles.wrap}>
    <View style={styles.hero}>
      <ShimmerLine width="42%" height={15} />
      <ShimmerLine width="72%" height={24} style={styles.title} />
      <View style={styles.tags}>
        <ShimmerLine width="22%" height={20} />
        <ShimmerLine width="40%" height={20} />
      </View>
    </View>

    {/* Padding on a wrapper, not margins on the shimmer — a 100%-width block
        with horizontal margins overflows its parent. */}
    <View style={styles.statusWrap}>
      <ShimmerCard height={124} radius={14} />
    </View>

    <View style={styles.timeline}>
      <ShimmerLine width="38%" height={10} style={styles.timelineHead} />

      {PHASES.map(phase => (
        <View key={`phase-${phase}`} style={styles.phase}>
          <ShimmerCircle size={30} />
          <View style={styles.phaseBody}>
            <ShimmerLine width="55%" height={13} />
            <ShimmerLine width="38%" height={10} style={styles.phaseDetail} />
          </View>
        </View>
      ))}
    </View>
  </View>
);

const styles = ScaledSheet.create({
  wrap: {flex: 1},
  hero: {
    paddingHorizontal: '18@s',
    paddingTop: '8@vs',
    paddingBottom: '16@vs',
    backgroundColor: colors.white,
    borderBottomWidth: '1@ms',
    borderBottomColor: colors.line,
  },
  title: {marginTop: '8@vs'},
  tags: {flexDirection: 'row', gap: '6@s', marginTop: '12@vs'},
  statusWrap: {paddingHorizontal: '16@s', marginTop: '12@vs'},
  timeline: {paddingHorizontal: '18@s', paddingTop: '18@vs'},
  timelineHead: {marginBottom: '16@vs'},
  phase: {flexDirection: 'row', gap: '12@s', marginBottom: '18@vs'},
  phaseBody: {flex: 1, paddingTop: '3@vs'},
  phaseDetail: {marginTop: '7@vs'},
});

export default DetailSkeleton;
