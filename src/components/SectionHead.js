import React from 'react';
import {View, TouchableOpacity} from 'react-native';

import AppText from './AppText';
import {colors, ScaledSheet} from '../theme';

/** "MOST URGENT · See all →" row. */
const SectionHead = ({label, linkLabel, onLinkPress, style}) => (
  <View style={[styles.row, style]}>
    <AppText variant="mono" size={10} tracking={1.3} uppercase weight="bold">
      {label}
    </AppText>
    {linkLabel ? (
      <TouchableOpacity activeOpacity={0.7} onPress={onLinkPress}>
        <AppText size={11} weight="bold" color={colors.tealDeep} tracking={0.3}>
          {linkLabel}
        </AppText>
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = ScaledSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '20@vs',
    marginBottom: '10@vs',
    marginHorizontal: '4@s',
  },
});

export default SectionHead;
