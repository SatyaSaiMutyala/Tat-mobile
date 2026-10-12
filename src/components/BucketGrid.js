import React from 'react';
import {View, TouchableOpacity} from 'react-native';

import AppText from './AppText';
import {colors, alpha, ScaledSheet} from '../theme';

/**
 * The 4-column coloured bucket strip used on Today's TAT and Past Overdue.
 *
 * buckets: [{key, label, bg, count, crit, stat, dark}]
 */
const BucketGrid = ({buckets, activeKey, onToggle}) => (
  <View style={styles.grid}>
    {buckets.map(bucket => {
      const active = activeKey === bucket.key;
      const empty = bucket.count === 0;
      const fg = bucket.dark ? colors.greenDeep : colors.white;
      const sub =
        `${bucket.crit ? `${bucket.crit}C` : ''}` +
        `${bucket.crit && bucket.stat ? '·' : ''}` +
        `${bucket.stat ? `${bucket.stat}S` : ''}` +
        `${!bucket.crit && !bucket.stat ? '·' : ''}`;

      return (
        <TouchableOpacity
          key={bucket.key}
          activeOpacity={empty ? 1 : 0.8}
          onPress={empty ? undefined : () => onToggle(bucket.key)}
          style={[
            styles.bucket,
            {backgroundColor: bucket.bg},
            empty && styles.empty,
            active && styles.active,
          ]}>
          <AppText
            variant="mono"
            size={8.5}
            weight="bold"
            tracking={0.6}
            align="center"
            color={fg}
            style={styles.label}>
            {bucket.label}
          </AppText>
          <AppText
            variant="display"
            size={20}
            tracking={0.5}
            align="center"
            color={fg}
            style={styles.count}>
            {bucket.count}
          </AppText>
          <AppText
            variant="mono"
            size={8}
            weight="semiBold"
            tracking={0.2}
            align="center"
            color={fg}
            style={styles.sub}>
            {sub}
          </AppText>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = ScaledSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '5@s',
    paddingHorizontal: '14@s',
    paddingTop: '12@vs',
    paddingBottom: '4@vs',
  },
  bucket: {
    width: '23.1%',
    borderRadius: '9@ms',
    paddingTop: '10@vs',
    paddingBottom: '9@vs',
    paddingHorizontal: '4@s',
  },
  empty: {opacity: 0.5},
  active: {
    borderTopWidth: '3@ms',
    borderBottomWidth: '3@ms',
    borderColor: colors.yellow,
  },
  label: {marginBottom: '3@vs', opacity: 0.95},
  count: {lineHeight: '24@ms'},
  sub: {marginTop: '3@vs', minHeight: '10@ms', opacity: 0.85},
});

export const BucketFilterNote = ({label, count, onClear}) => (
  <View style={noteStyles.note}>
    <AppText size={11} weight="semiBold" color={colors.greenDeep} style={noteStyles.text}>
      Filtered to {label} · {count} samples
    </AppText>
    <TouchableOpacity activeOpacity={0.7} onPress={onClear}>
      <AppText variant="mono" size={10} weight="bold" color={colors.tealDeep} tracking={0.3}>
        ✕ Clear
      </AppText>
    </TouchableOpacity>
  </View>
);

const noteStyles = ScaledSheet.create({
  note: {
    paddingHorizontal: '16@s',
    paddingVertical: '8@vs',
    backgroundColor: alpha.yellowNote,
    borderTopWidth: '1@ms',
    borderBottomWidth: '1@ms',
    borderColor: alpha.yellowNoteLine,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10@s',
  },
  text: {flex: 1},
});

export default BucketGrid;
