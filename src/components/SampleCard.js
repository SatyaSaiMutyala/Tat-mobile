import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import AccentBar from './AccentBar';
import AppText from './AppText';
import Tag from './Tag';
import {colors, ScaledSheet} from '../theme';

const EDGE = {
  ok: colors.teal,
  tight: colors.warn,
  past: colors.crit,
  stale: '#6F211B',
};

/**
 * Matches the design's `linear-gradient(to right, tint 0%, white 5%)` —
 * only a sliver of colour bleeds in from the left edge.
 */
const TINT = {
  ok: [colors.white, colors.white],
  tight: [colors.warnTint, colors.white],
  past: [colors.critTint, colors.white],
  stale: [colors.critTint, colors.white],
};

const TIME_COLOR = {
  ok: colors.ok,
  tight: colors.warn,
  past: colors.crit,
  stale: colors.crit,
};

/**
 * Sample row used by both Today's TAT and Past Overdue.
 *
 *   <SampleCard tone="past" code="BE1001234" tags={[{label:'CRIT', tone:'crit'}]}
 *               testName="HbA1c" meta="…" timeLabel="−2h OVER" phase="Validation" />
 */
const SampleCard = ({
  tone = 'ok',
  code,
  tags = [],
  testName,
  meta,
  timeLabel,
  phase,
  onPress,
}) => (
  <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
    <AccentBar color={EDGE[tone] || EDGE.ok} />

    <LinearGradient
      colors={TINT[tone] || TINT.ok}
      locations={[0, 0.06]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={styles.inner}>
      <View style={styles.top}>
        <AppText variant="mono" size={11.5} weight="semiBold" color={colors.ink3} tracking={0.3}>
          {code}
        </AppText>
        <View style={styles.tags}>
          {tags.map(tag => (
            <Tag key={tag.label} label={tag.label} tone={tag.tone} />
          ))}
        </View>
      </View>

      {/* Single-line so every row is the same height — variable heights make
          FlatList mis-estimate scroll offsets and jump. */}
      <AppText size={13.5} weight="bold" numberOfLines={1} style={styles.test}>
        {testName}
      </AppText>
      <AppText
        variant="mono"
        size={10}
        tracking={0.3}
        numberOfLines={1}
        style={styles.meta}>
        {meta}
      </AppText>

      <View style={styles.bottom}>
        <AppText
          variant="mono"
          size={12.5}
          weight="extraBold"
          tracking={0.3}
          color={TIME_COLOR[tone] || TIME_COLOR.ok}>
          {timeLabel}
        </AppText>
        <View style={styles.phase}>
          <AppText
            variant="mono"
            size={9}
            weight="extraBold"
            tracking={0.5}
            uppercase
            color={colors.warn}>
            {phase}
          </AppText>
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = ScaledSheet.create({
  card: {
    marginBottom: '8@vs',
    borderWidth: '1@ms',
    borderColor: colors.line,
    borderRadius: '14@ms',
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  inner: {
    paddingLeft: '18@s',
    paddingRight: '14@s',
    paddingVertical: '12@vs',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '8@s',
    marginBottom: '4@vs',
  },
  tags: {flexDirection: 'row', gap: '4@s'},
  test: {marginTop: '3@vs', lineHeight: '16@ms'},
  meta: {marginTop: '3@vs'},
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '9@vs',
    paddingTop: '9@vs',
    borderTopWidth: '1@ms',
    borderTopColor: colors.line,
    borderStyle: 'dashed',
  },
  phase: {
    backgroundColor: colors.warnTint,
    paddingHorizontal: '8@s',
    paddingVertical: '3@vs',
    borderRadius: '5@ms',
  },
});

/**
 * Memoised: appending a page must not re-render the rows already on screen.
 * Callers should pass a stable `onPress` for this to hold.
 */
export default React.memo(SampleCard);
