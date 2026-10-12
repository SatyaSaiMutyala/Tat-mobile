import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';

import AppText from './AppText';
import PulseDot from './PulseDot';
import RadialGlow from './RadialGlow';
import {colors, gradients, alpha, shadow, ms, ScaledSheet} from '../theme';

const TONE = {
  crit: {gradient: gradients.crit, shadow: shadow.heroCrit},
  warn: {gradient: gradients.warn, shadow: shadow.heroWarn},
  ok: {gradient: gradients.ok, shadow: shadow.heroOk},
};

/**
 * The big status card at the top of Home.
 *
 *   <HeroCard tone="crit" eyebrow="LIVE OVERDUE QUEUE" value={22}
 *             caption={<>...</>} onPress={...} />
 */
const HeroCard = ({tone = 'crit', eyebrow, value, children, onPress}) => {
  const t = TONE[tone] || TONE.crit;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={t.shadow}>
      <LinearGradient
        colors={t.gradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.card}>
        <RadialGlow
          size={ms(160)}
          color="255,255,255"
          opacity={0.5}
          style={styles.glow}
        />

        <View style={styles.eyebrowRow}>
          <PulseDot size={ms(7)} />
          <AppText
            variant="mono"
            size={10}
            tracking={1.5}
            uppercase
            weight="bold"
            color={alpha.white88}>
            {eyebrow}
          </AppText>
        </View>

        <AppText
          variant="display"
          size={46}
          tracking={1}
          color={colors.white}
          style={styles.value}>
          {value}
        </AppText>

        <View style={styles.caption}>{children}</View>

        <Feather
          name="arrow-right"
          size={ms(24)}
          color={alpha.white85}
          style={styles.arrow}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = ScaledSheet.create({
  card: {
    borderRadius: '20@ms',
    paddingHorizontal: '20@s',
    paddingVertical: '22@vs',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    right: '-40@s',
    top: '-40@vs',
  },
  eyebrowRow: {flexDirection: 'row', alignItems: 'center', gap: '8@s'},
  value: {
    marginTop: '4@vs',
    marginBottom: '4@vs',
    // Android clips glyphs to the line box, so lineHeight must exceed the
    // font size — the design's CSS `line-height: 0.9` would cut the digits off.
    lineHeight: '54@ms',
  },
  caption: {paddingRight: '40@s'},
  arrow: {position: 'absolute', bottom: '18@vs', right: '22@s'},
});

export default HeroCard;
