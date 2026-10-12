import React from 'react';
import {
  View,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import AppText from './AppText';
import {colors, alpha, ms, ScaledSheet} from '../theme';

/**
 * Bottom-sheet single-choice picker.
 *
 *   <OptionSheet
 *     visible={open}
 *     title="Department"
 *     options={[{key: null, label: 'All departments'}, …]}
 *     selected={dept}
 *     onSelect={…}
 *     onClose={…}
 *   />
 *
 * Options carry an optional `caption`, `code` (mono prefix on the caption line)
 * and `count`. Backing the branch, department and dataset pickers.
 */
const OptionSheet = ({
  visible,
  title,
  subtitle,
  options = [],
  selected,
  onSelect,
  onClose,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
    statusBarTranslucent>
    <Pressable style={styles.backdrop} onPress={onClose} />

    <View style={styles.sheet}>
      <View style={styles.grabber} />

      <AppText variant="display" size={16} tracking={1} style={styles.title}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText size={11.5} color={colors.ink3} style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {/* `key` is pulled out of the spread: React warns when a spread object
            still carries one, even if an explicit key is also passed. */}
        {options.map(({key, ...option}) => (
          <Option
            key={String(key)}
            {...option}
            active={selected === key}
            onPress={() => onSelect(key)}
          />
        ))}
      </ScrollView>
    </View>
  </Modal>
);

const Option = ({label, caption, code, count, active, onPress}) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    style={[styles.option, active && styles.optionActive]}>
    <View style={styles.optionText}>
      <AppText size={13.5} weight="bold" numberOfLines={1}>
        {label}
      </AppText>
      {caption || code ? (
        <AppText
          variant="mono"
          size={10}
          tracking={0.3}
          numberOfLines={1}
          style={styles.caption}>
          {code ? `${code} · ` : ''}
          {caption}
        </AppText>
      ) : null}
    </View>

    {typeof count === 'number' ? (
      <AppText variant="mono" size={11} weight="bold" color={colors.ink3}>
        {count}
      </AppText>
    ) : null}

    {active ? (
      <Ionicons name="checkmark-circle" size={ms(20)} color={colors.tealDeep} />
    ) : null}
  </TouchableOpacity>
);

const styles = ScaledSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,20,16,0.45)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '70%',
    backgroundColor: colors.paper,
    borderTopLeftRadius: '20@ms',
    borderTopRightRadius: '20@ms',
    paddingHorizontal: '16@s',
    paddingTop: '10@vs',
    paddingBottom: '24@vs',
  },
  grabber: {
    alignSelf: 'center',
    width: '40@s',
    height: '4@vs',
    borderRadius: '2@ms',
    backgroundColor: colors.line,
    marginBottom: '14@vs',
  },
  title: {marginBottom: '2@vs'},
  subtitle: {marginBottom: '14@vs'},
  list: {flexGrow: 0},
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12@s',
    backgroundColor: colors.white,
    borderWidth: '1@ms',
    borderColor: colors.line,
    borderRadius: '12@ms',
    paddingHorizontal: '14@s',
    paddingVertical: '13@vs',
    marginBottom: '8@vs',
  },
  optionActive: {
    borderColor: colors.teal,
    backgroundColor: alpha.tealFaint,
  },
  optionText: {flex: 1, minWidth: 0},
  caption: {marginTop: '3@vs'},
});

export default OptionSheet;
