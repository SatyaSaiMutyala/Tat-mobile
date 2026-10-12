import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import AppText from './AppText';
import Avatar from './Avatar';
import CountBadge from './CountBadge';
import PulseDot from './PulseDot';
import {colors, ms, ScaledSheet} from '../theme';

/**
 * Home screen header — avatar, greeting block, notification bell.
 *
 * The bell shows the unread notification count when there is one. With nothing
 * unread it falls back to the pulsing dot, which flags live TAT trouble even
 * when every notification has already been read.
 */
const HomeHeader = ({
  user,
  greeting,
  onBellPress,
  showDot = true,
  unreadCount = 0,
}) => (
  <View style={styles.header}>
    <Avatar initials={user?.initials ?? '—'} />

    <View style={styles.greet}>
      <AppText variant="mono" size={9} tracking={1} uppercase weight="semiBold" numberOfLines={1}>
        {user?.role_label}
        {user?.branch?.name ? ` · ${user.branch.name}` : ''}
      </AppText>
      <AppText size={15} weight="bold" numberOfLines={1} style={styles.name}>
        {greeting}, {(user?.name ?? '').split(' ')[0]}
      </AppText>
    </View>

    <TouchableOpacity style={styles.bell} activeOpacity={0.7} onPress={onBellPress}>
      <Feather name="bell" size={ms(18)} color={colors.ink2} />

      {unreadCount > 0 ? (
        // Inside the circle: Android clips children that overflow a parent
        // with a borderRadius.
        <CountBadge
          count={unreadCount}
          ringColor={colors.paper2}
          style={styles.badge}
        />
      ) : showDot ? (
        <View style={styles.dotWrap}>
          <PulseDot size={ms(9)} color={colors.crit} ring={false} />
        </View>
      ) : null}
    </TouchableOpacity>
  </View>
);

const styles = ScaledSheet.create({
  header: {
    paddingHorizontal: '18@s',
    paddingTop: '8@vs',
    paddingBottom: '14@vs',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12@s',
    backgroundColor: colors.white,
    borderBottomWidth: '1@ms',
    borderBottomColor: colors.line,
  },
  greet: {flex: 1, minWidth: 0},
  name: {marginTop: '2@vs', lineHeight: '18@ms'},
  bell: {
    width: '40@ms',
    height: '40@ms',
    borderRadius: '20@ms',
    backgroundColor: colors.paper2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {top: '3@vs', right: '2@s'},
  dotWrap: {
    position: 'absolute',
    top: '8@ms',
    right: '8@ms',
    borderWidth: '2@ms',
    borderColor: colors.paper2,
    borderRadius: '8@ms',
  },
});

export default HomeHeader;
