import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

import AppText from './AppText';
import {colors, gradients, alpha, shadow, ScaledSheet} from '../theme';

const TONE = {
  past: {gradient: gradients.crit, shadow: shadow.heroCrit},
  tight: {gradient: gradients.warn, shadow: shadow.heroWarn},
  ok: {gradient: gradients.ok, shadow: shadow.heroOk},
  released: {gradient: gradients.released, shadow: shadow.heroOk},
};

/** The SLA status banner at the top of the sample detail screen. */
const StatusCard = ({tone = 'ok', eyebrow, value, children}) => {
  const t = TONE[tone] || TONE.ok;

  return (
    <LinearGradient
      colors={t.gradient}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={[styles.card, t.shadow]}>
      <AppText
        variant="mono"
        size={9.5}
        tracking={1.2}
        uppercase
        weight="bold"
        color={alpha.white85}>
        {eyebrow}
      </AppText>
      <AppText
        variant="display"
        size={28}
        tracking={1}
        color={colors.white}
        numberOfLines={1}
        adjustsFontSizeToFit
        style={styles.value}>
        {value}
      </AppText>
      {children}
    </LinearGradient>
  );
};

const styles = ScaledSheet.create({
  card: {
    marginHorizontal: '16@s',
    marginTop: '12@vs',
    borderRadius: '14@ms',
    paddingHorizontal: '18@s',
    paddingVertical: '16@vs',
  },
  value: {marginTop: '4@vs', lineHeight: '34@ms'},
});

export default StatusCard;
