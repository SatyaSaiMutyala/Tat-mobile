import React from 'react';
import {View} from 'react-native';

import {ShimmerCard, ShimmerLine} from './Shimmer';
import {ScaledSheet} from '../theme';

/** Placeholder rows shaped like <SampleCard />, for list first-loads. */
const ListSkeleton = ({rows = 5}) => (
  <View style={styles.wrap}>
    {Array.from({length: rows}).map((_, index) => (
      <ShimmerCard key={`row-${index}`} style={styles.card}>
        <View style={styles.inner}>
          <View style={styles.topRow}>
            <ShimmerLine width="38%" height={11} />
            <ShimmerLine width="18%" height={13} />
          </View>
          <ShimmerLine width="58%" height={14} style={styles.gap} />
          <ShimmerLine width="76%" height={9} style={styles.gapSm} />
          <View style={styles.bottomRow}>
            <ShimmerLine width="34%" height={12} />
            <ShimmerLine width="26%" height={12} />
          </View>
        </View>
      </ShimmerCard>
    ))}
  </View>
);

const styles = ScaledSheet.create({
  wrap: {paddingHorizontal: '14@s', paddingTop: '10@vs'},
  card: {marginBottom: '8@vs'},
  inner: {paddingHorizontal: '14@s', paddingVertical: '13@vs'},
  topRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  gap: {marginTop: '9@vs'},
  gapSm: {marginTop: '6@vs'},
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '14@vs',
  },
});

export default ListSkeleton;
