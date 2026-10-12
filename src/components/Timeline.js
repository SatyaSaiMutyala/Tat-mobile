import React from 'react';
import {View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import AppText from './AppText';
import {colors, ms, ScaledSheet} from '../theme';

const DOT = {
  done: {bg: colors.ok, fg: colors.white},
  active: {bg: colors.yellow, fg: colors.greenDeep},
  stuck: {bg: colors.crit, fg: colors.white},
  pending: {bg: colors.paper2, fg: colors.ink4},
};

const CONNECTOR = {
  done: colors.ok,
  stuck: colors.crit,
  pending: colors.line,
};

/**
 * 6-phase pipeline.
 *
 * phases: [{name, state: 'done'|'stuck'|'pending', detail, duration, durationTone}]
 */
const Timeline = ({title = '6-PHASE PIPELINE', phases}) => (
  <View style={styles.wrap}>
    <AppText variant="mono" size={10} tracking={1.3} uppercase weight="bold" style={styles.head}>
      {title}
    </AppText>

    {phases.map((phase, index) => {
      const dot = DOT[phase.state] || DOT.pending;
      const isLast = index === phases.length - 1;

      return (
        <View key={phase.name} style={styles.item}>
          <View style={styles.rail}>
            <View style={[styles.dot, {backgroundColor: dot.bg}]}>
              {phase.state === 'done' ? (
                <Feather name="check" size={ms(15)} color={dot.fg} />
              ) : (
                <AppText size={13} weight="extraBold" color={dot.fg}>
                  {phase.state === 'stuck' ? '!' : String(index + 1)}
                </AppText>
              )}
            </View>
            {!isLast ? (
              <View
                style={[
                  styles.connector,
                  {backgroundColor: CONNECTOR[phase.state] || CONNECTOR.pending},
                  phase.state === 'done' && styles.connectorDone,
                ]}
              />
            ) : null}
          </View>

          <View style={styles.body}>
            <AppText
              size={13}
              weight="extraBold"
              color={phase.state === 'pending' ? colors.ink4 : colors.ink}>
              {phase.name}
            </AppText>
            <AppText variant="mono" size={10} tracking={0.3} style={styles.detail}>
              {phase.detail}
            </AppText>
            {phase.duration ? (
              <AppText
                variant="mono"
                size={10.5}
                weight="extraBold"
                tracking={0.3}
                color={phase.durationTone === 'stuck' ? colors.crit : colors.ok}
                style={styles.duration}>
                {phase.duration}
              </AppText>
            ) : null}
          </View>
        </View>
      );
    })}
  </View>
);

const styles = ScaledSheet.create({
  wrap: {
    paddingHorizontal: '18@s',
    paddingTop: '16@vs',
    paddingBottom: '12@vs',
  },
  head: {marginBottom: '12@vs'},
  item: {flexDirection: 'row', gap: '12@s'},
  rail: {width: '30@ms', alignItems: 'center'},
  dot: {
    width: '30@ms',
    height: '30@ms',
    borderRadius: '15@ms',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connector: {
    width: '2@ms',
    flex: 1,
    minHeight: '18@vs',
    marginVertical: '2@vs',
  },
  connectorDone: {opacity: 0.4},
  body: {flex: 1, paddingTop: '4@vs', paddingBottom: '10@vs'},
  detail: {marginTop: '2@vs'},
  duration: {marginTop: '3@vs'},
});

export default Timeline;
