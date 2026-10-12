import React from 'react';
import {View, ScrollView, TouchableOpacity} from 'react-native';

import AppText from './AppText';
import {colors, ScaledSheet} from '../theme';

/**
 * Horizontal filter chip strip.
 *
 *   <Chips items={[{key:'all', label:'All', count: 12}]} value={chip} onChange={setChip} />
 *
 * The wrapper carries an explicit height — a horizontal ScrollView inside a
 * column flex parent does not derive its height from content.
 *
 * `divider={false}` drops the hairline underneath, for screens where a search
 * bar follows and two rules would stack up against each other.
 */
const Chips = ({items, value, onChange, divider = true}) => (
  <View style={[styles.strip, divider && styles.stripDivider]}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}>
      {items.map(item => {
        const active = item.key === value;
        return (
          <TouchableOpacity
            key={item.key}
            activeOpacity={0.8}
            onPress={() => onChange(item.key)}
            style={[styles.chip, active && styles.chipActive]}>
            <AppText
              size={11}
              weight="bold"
              tracking={0.4}
              color={active ? colors.white : colors.ink3}>
              {item.label}
            </AppText>
            {item.count !== undefined ? (
              <AppText
                variant="mono"
                size={10}
                style={styles.count}
                color={active ? colors.yellow : colors.ink3}>
                {item.count}
              </AppText>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

const styles = ScaledSheet.create({
  strip: {
    height: '52@vs',
    backgroundColor: colors.white,
  },
  stripDivider: {
    borderBottomWidth: '1@ms',
    borderBottomColor: colors.line,
  },
  content: {
    paddingHorizontal: '16@s',
    gap: '6@s',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '30@vs',
    paddingHorizontal: '13@s',
    borderRadius: '999@ms',
    borderWidth: '1@ms',
    borderColor: colors.line,
  },
  chipActive: {
    backgroundColor: colors.greenDeep,
    borderColor: colors.greenDeep,
  },
  count: {marginLeft: '5@s', opacity: 0.9},
});

export default Chips;
