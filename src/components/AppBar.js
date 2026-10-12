import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import AppText from './AppText';
import CountBadge from './CountBadge';
import {colors, ms, ScaledSheet} from '../theme';

/**
 * Top bar: optional back button, eyebrow + display title, optional right icon
 * carrying an optional count badge.
 *
 *   <AppBar title="TODAY'S TAT" rightIcon="bell" rightBadge={unreadCount} />
 */
const AppBar = ({
  eyebrow,
  title,
  onBack,
  rightIcon,
  onRightPress,
  rightBadge = 0,
}) => (
  <View style={styles.bar}>
    {onBack ? (
      <TouchableOpacity style={styles.iconBox} activeOpacity={0.7} onPress={onBack}>
        <Feather name="chevron-left" size={ms(18)} color={colors.ink2} />
      </TouchableOpacity>
    ) : null}

    <View style={styles.titleWrap}>
      {eyebrow ? (
        <AppText variant="mono" size={9} tracking={1.4} uppercase weight="semiBold">
          {eyebrow}
        </AppText>
      ) : null}
      {/* Same treatment as the Home header's greeting line, so every screen
          reads with one consistent title size. */}
      <AppText size={15} weight="bold" numberOfLines={1} style={styles.title}>
        {title}
      </AppText>
    </View>

    {rightIcon ? (
      <TouchableOpacity style={styles.iconBox} activeOpacity={0.7} onPress={onRightPress}>
        <Feather name={rightIcon} size={ms(18)} color={colors.ink2} />
        {/* Pinned inside the rounded box — Android clips children that
            overflow a parent with a borderRadius. */}
        <CountBadge
          count={rightBadge}
          ringColor={colors.paper2}
          style={styles.badge}
        />
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = ScaledSheet.create({
  bar: {
    paddingHorizontal: '18@s',
    paddingTop: '12@vs',
    paddingBottom: '14@vs',
    backgroundColor: colors.white,
    borderBottomWidth: '1@ms',
    borderBottomColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12@s',
  },
  iconBox: {
    width: '36@ms',
    height: '36@ms',
    borderRadius: '10@ms',
    backgroundColor: colors.paper2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {top: '1@vs', right: '1@s'},
  titleWrap: {flex: 1, minWidth: 0},
  title: {marginTop: '2@vs', lineHeight: '18@ms'},
});

export default AppBar;
