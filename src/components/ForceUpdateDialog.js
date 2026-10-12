import React from 'react';
import {View, Modal, StyleSheet, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import AppText from './AppText';
import {colors, alpha, shadow, ms, ScaledSheet} from '../theme';

const swallowBack = () => {};

/**
 * Blocking "update required" dialog, driven by `useForceUpdate`.
 *
 * Unlike ConfirmDialog there is no dismiss path: the backdrop is inert and
 * the Android back button is swallowed. Updating is the only way out.
 *
 *   <ForceUpdateDialog
 *     visible={updateRequired}
 *     storeVersion={storeVersion}
 *     onUpdate={openStore}
 *   />
 */
const ForceUpdateDialog = ({visible, storeVersion, onUpdate}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={swallowBack}
    statusBarTranslucent>
    <View style={styles.backdrop} />

    <View style={styles.centre} pointerEvents="box-none">
      <View style={[styles.card, shadow.dialog]}>
        <View style={styles.icon}>
          <Ionicons
            name="cloud-download-outline"
            size={ms(26)}
            color={colors.tealDeep}
          />
        </View>

        <AppText
          variant="display"
          size={18}
          tracking={0.8}
          align="center"
          style={styles.title}>
          Update required
        </AppText>

        <AppText size={12.5} align="center" lineHeight={19} color={colors.ink3}>
          {storeVersion
            ? `A new version of Trust TAT (v${storeVersion}) is available.`
            : 'A new version of Trust TAT is available.'}
          {'\n\n'}
          Please update to continue using the app.
        </AppText>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onUpdate}
          style={styles.button}>
          <Ionicons name="download-outline" size={ms(16)} color={colors.white} />
          <AppText
            size={12.5}
            weight="extraBold"
            tracking={0.6}
            uppercase
            color={colors.white}>
            Update now
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = ScaledSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,20,16,0.5)',
  },
  centre: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '32@s',
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: '20@ms',
    paddingHorizontal: '22@s',
    paddingTop: '24@vs',
    paddingBottom: '18@vs',
    alignItems: 'center',
  },
  icon: {
    width: '56@ms',
    height: '56@ms',
    borderRadius: '28@ms',
    backgroundColor: alpha.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '14@vs',
  },
  title: {marginBottom: '6@vs'},
  button: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: '8@s',
    height: '46@vs',
    borderRadius: '12@ms',
    backgroundColor: colors.tealDeep,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '22@vs',
  },
});

export default ForceUpdateDialog;
