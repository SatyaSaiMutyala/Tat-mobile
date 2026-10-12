import React from 'react';
import {View, TextInput, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {colors, fonts, ms, ScaledSheet} from '../theme';

/**
 * Search input used above the sample lists and the SLA ledger.
 *
 *   <SearchBar value={term} onChangeText={setTerm} placeholder="Search…" />
 *
 * The clear button appears only once there is something to clear, so the row
 * does not shift as the user starts typing.
 */
const SearchBar = ({value, onChangeText, placeholder = 'Search', style}) => (
  <View style={[styles.bar, style]}>
    <Ionicons name="search" size={ms(16)} color={colors.ink4} />

    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor={colors.ink4}
      value={value}
      onChangeText={onChangeText}
      autoCapitalize="none"
      autoCorrect={false}
      allowFontScaling={false}
      returnKeyType="search"
      clearButtonMode="never"
    />

    {value ? (
      <TouchableOpacity
        onPress={() => onChangeText('')}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <Ionicons name="close-circle" size={ms(16)} color={colors.ink4} />
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = ScaledSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '10@s',
    backgroundColor: colors.white,
    borderWidth: '1@ms',
    borderColor: colors.line,
    borderRadius: '12@ms',
    paddingHorizontal: '12@s',
    height: '44@vs',
  },
  input: {
    flex: 1,
    padding: 0,
    fontFamily: fonts.regular,
    fontSize: '13@ms',
    color: colors.ink,
  },
});

export default SearchBar;
