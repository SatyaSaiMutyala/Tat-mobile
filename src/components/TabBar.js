import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

import AppText from './AppText';
import CountBadge from './CountBadge';
import {colors, alpha, shadow, ms, vs, ScaledSheet} from '../theme';

const BADGE_COLOR = {
  crit: colors.crit,
  teal: colors.teal,
  warn: colors.warn,
};

/**
 * Custom 5-column bottom navigation.
 *
 * The active tab is marked four ways so it reads instantly:
 * a top accent bar, a filled pill behind the icon, a colour shift on both
 * icon and label, and a heavier label weight.
 *
 * Used as `tabBar` for the bottom-tab navigator.
 */
const TabBar = ({state, descriptors, navigation}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        shadow.tabbar,
        {paddingBottom: Math.max(insets.bottom, vs(6))},
      ]}>
      {state.routes.map((route, index) => {
        const {options} = descriptors[route.key];
        const focused = state.index === index;
        const badge = options.tabBarBadge;
        const badgeTone = options.tabBarBadgeStyle?.tone || 'crit';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.7}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{selected: focused}}
            accessibilityLabel={options.title || route.name}
            style={styles.tab}>
            {focused ? <View style={styles.indicator} /> : null}

            <View style={styles.iconWrap}>
              {/* The pill is an empty leaf view behind the icon. Android drops
                  border radius on a rounded view once siblings overlap it, so
                  it must not contain the icon or the badge. */}
              {focused ? <View style={styles.pill} /> : null}

              <View style={styles.iconBox}>
                <Feather
                  name={options.tabBarIconName}
                  size={ms(21)}
                  color={focused ? colors.tealDeep : colors.ink4}
                />
              </View>

              <CountBadge count={badge} tone={BADGE_COLOR[badgeTone]} />
            </View>

            <AppText
              size={9.5}
              weight={focused ? 'extraBold' : 'medium'}
              tracking={0.4}
              uppercase
              align="center"
              color={focused ? colors.tealDeep : colors.ink4}
              style={styles.label}>
              {options.title || route.name}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = ScaledSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: '1@ms',
    borderTopColor: colors.line,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: '9@vs',
    paddingBottom: '6@vs',
    paddingHorizontal: '2@s',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: '30@s',
    height: '3@ms',
    borderRadius: '2@ms',
    backgroundColor: colors.teal,
  },
  iconWrap: {width: '52@s', height: '30@vs'},
  pill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    // Half the height — a real value, not a 999 sentinel.
    borderRadius: '15@vs',
    backgroundColor: alpha.tealTint,
  },
  iconBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {marginTop: '3@vs'},
});

export default TabBar;
