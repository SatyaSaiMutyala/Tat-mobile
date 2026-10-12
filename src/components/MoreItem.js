import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import AppText from './AppText';
import {colors, alpha, ms, ScaledSheet} from '../theme';

const FAMILIES = {
  ion: Ionicons,
  feather: Feather,
  mci: MCIcon,
};

/**
 * Settings list row: tinted icon tile, label + caption, chevron.
 * Defaults to the Ionicons outline set so every row shares one stroke weight.
 */
const MoreItem = ({
  icon,
  family = 'ion',
  label,
  caption,
  danger = false,
  onPress,
}) => {
  const Icon = FAMILIES[family] || Ionicons;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.item}>
      <View style={[styles.iconTile, danger && styles.iconTileDanger]}>
        <Icon
          name={icon}
          size={ms(19)}
          color={danger ? colors.crit : colors.tealDeep}
        />
      </View>

      <View style={styles.text}>
        <AppText size={13.5} weight="bold" color={danger ? colors.crit : colors.ink}>
          {label}
        </AppText>
        {caption ? (
          <AppText size={10.5} weight="medium" color={colors.ink4} style={styles.caption}>
            {caption}
          </AppText>
        ) : null}
      </View>

      <Ionicons
        name="chevron-forward"
        size={ms(16)}
        color={danger ? colors.crit : colors.ink4}
      />
    </TouchableOpacity>
  );
};

const styles = ScaledSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '13@s',
    backgroundColor: colors.white,
    borderWidth: '1@ms',
    borderColor: colors.line,
    borderRadius: '12@ms',
    paddingHorizontal: '14@s',
    paddingVertical: '13@vs',
    marginBottom: '6@vs',
  },
  iconTile: {
    width: '38@ms',
    height: '38@ms',
    borderRadius: '11@ms',
    backgroundColor: alpha.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTileDanger: {backgroundColor: colors.critTint},
  text: {flex: 1, minWidth: 0},
  caption: {marginTop: '2@vs'},
});

export default MoreItem;
