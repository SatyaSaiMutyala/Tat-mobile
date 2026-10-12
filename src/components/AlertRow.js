import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import AccentBar from './AccentBar';
import AppText from './AppText';
import {colors, alpha, ms, ScaledSheet} from '../theme';

const KIND = {
  crit: {icon: 'alert-triangle', bg: colors.critTint, fg: colors.crit},
  warn: {icon: 'bell', bg: colors.warnTint, fg: colors.warn},
  info: {icon: 'send', bg: alpha.tealTint, fg: colors.tealDeep},
  ok: {icon: 'check-circle', bg: colors.okTint, fg: colors.ok},
};

/** One notification row in the Alerts feed. */
const AlertRow = ({kind = 'info', unread, title, time, children, onPress}) => {
  const k = KIND[kind] || KIND.info;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.row, unread && styles.unread]}>
      {unread || kind === 'crit' ? (
        <AccentBar color={kind === 'crit' ? colors.crit : colors.teal} width={ms(3)} />
      ) : null}

      <View style={[styles.icon, {backgroundColor: k.bg}]}>
        <Feather name={k.icon} size={ms(20)} color={k.fg} />
      </View>

      <View style={styles.body}>
        <AppText size={13} weight="extraBold" lineHeight={17}>
          {title}
        </AppText>
        <View style={styles.message}>{children}</View>
      </View>

      <AppText variant="mono" size={10} weight="semiBold" tracking={0.3} style={styles.time}>
        {time}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = ScaledSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '12@s',
    backgroundColor: colors.white,
    borderWidth: '1@ms',
    borderColor: colors.line,
    borderRadius: '14@ms',
    overflow: 'hidden',
    paddingLeft: '16@s',
    paddingRight: '13@s',
    paddingVertical: '11@vs',
    marginBottom: '7@vs',
  },
  unread: {backgroundColor: alpha.tealFaint},
  icon: {
    width: '40@ms',
    height: '40@ms',
    borderRadius: '20@ms',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {flex: 1, minWidth: 0},
  message: {marginTop: '3@vs'},
  time: {paddingTop: '3@vs'},
});

export default AlertRow;
