import React from 'react';
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import AppText from './AppText';
import {colors, shadow, ms, ScaledSheet} from '../theme';

const TONE = {
  danger: {accent: colors.crit, tint: colors.critTint},
  default: {accent: colors.tealDeep, tint: 'rgba(0,180,154,0.14)'},
};

/**
 * Themed confirmation dialog — replaces the OS `Alert`, which ignores the
 * app's typography and colours.
 *
 *   <ConfirmDialog
 *     visible={open}
 *     tone="danger"
 *     icon="log-out-outline"
 *     title="Sign out"
 *     message="You'll need to sign in again."
 *     confirmLabel="Sign out"
 *     onConfirm={…}
 *     onCancel={…}
 *   />
 */
const ConfirmDialog = ({
  visible,
  tone = 'default',
  icon = 'help-circle-outline',
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const t = TONE[tone] || TONE.default;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent>
      {/* Tapping outside cancels — matches the platform expectation. */}
      <Pressable style={styles.backdrop} onPress={loading ? undefined : onCancel} />

      <View style={styles.centre} pointerEvents="box-none">
        <View style={[styles.card, shadow.dialog]}>
          <View style={[styles.icon, {backgroundColor: t.tint}]}>
            <Ionicons name={icon} size={ms(26)} color={t.accent} />
          </View>

          <AppText variant="display" size={18} tracking={0.8} align="center" style={styles.title}>
            {title}
          </AppText>

          {message ? (
            <AppText size={12.5} align="center" lineHeight={19} color={colors.ink3}>
              {message}
            </AppText>
          ) : null}

          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onCancel}
              disabled={loading}
              style={[styles.button, styles.cancel]}>
              <AppText size={12.5} weight="bold" tracking={0.6} uppercase color={colors.ink2}>
                {cancelLabel}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onConfirm}
              disabled={loading}
              style={[styles.button, {backgroundColor: t.accent}, loading && styles.busy]}>
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <AppText size={12.5} weight="extraBold" tracking={0.6} uppercase color={colors.white}>
                  {confirmLabel}
                </AppText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '14@vs',
  },
  title: {marginBottom: '6@vs'},
  actions: {
    flexDirection: 'row',
    gap: '10@s',
    marginTop: '22@vs',
    alignSelf: 'stretch',
  },
  button: {
    flex: 1,
    height: '46@vs',
    borderRadius: '12@ms',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancel: {
    backgroundColor: colors.paper2,
    borderWidth: '1@ms',
    borderColor: colors.line,
  },
  busy: {opacity: 0.7},
});

export default ConfirmDialog;
