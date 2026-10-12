import React from 'react';
import {View, TouchableOpacity} from 'react-native';

import {
  AppText,
  AuthButton,
  AuthLayout,
  FormError,
  TextField,
} from '../components';
import usePasswordForm from '../hooks/usePasswordForm';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
  changePassword,
  clearAuthError,
  signOut,
  selectAuth,
} from '../store/slices/authSlice';
import {showToast} from '../store/slices/uiSlice';
import {alpha, ScaledSheet} from '../theme';

/**
 * Shown when the API reports `must_change_password`. It is the only reachable
 * screen in that state — the dashboard stays gated until the flag clears.
 *
 * Shares its rules with the voluntary `UpdatePasswordScreen` via
 * `usePasswordForm`; only the chrome differs.
 */
const ChangePasswordScreen = () => {
  const dispatch = useAppDispatch();
  const {status, error, fieldErrors, user} = useAppSelector(selectAuth);

  const form = usePasswordForm();
  const {values, errors, valid} = form;

  const loading = status === 'loading';

  const onSubmit = async () => {
    form.setTouched(true);
    if (!valid || loading) {
      return;
    }

    const result = await dispatch(changePassword(form.payload));

    if (changePassword.fulfilled.match(result)) {
      dispatch(showToast('Password updated · signed in'));
    }
  };

  const onChange = setter => value => {
    if (error) {
      dispatch(clearAuthError());
    }
    setter(value);
  };

  return (
    <AuthLayout
      title="SET PASSWORD"
      tagline={user?.email || 'TEMPORARY PASSWORD'}
      footer={
        <TouchableOpacity activeOpacity={0.7} onPress={() => dispatch(signOut())}>
          <AppText size={12} align="center" color={alpha.white55}>
            Sign in as someone else
          </AppText>
        </TouchableOpacity>
      }>
      <View style={styles.intro}>
        <AppText size={12.5} lineHeight={19} align="center" color={alpha.white70}>
          Your account is on a temporary password. Choose a new one to continue.
        </AppText>
      </View>

      <FormError message={error} />

      <TextField
        icon="lock"
        placeholder="Current password"
        secureTextEntry
        autoCapitalize="none"
        value={values.current}
        onChangeText={onChange(form.setCurrent)}
        editable={!loading}
      />
      <FieldNote message={errors.current || fieldErrors?.current_password?.[0]} />

      <TextField
        icon="key"
        placeholder="New password"
        secureTextEntry
        autoCapitalize="none"
        value={values.next}
        onChangeText={onChange(form.setNext)}
        editable={!loading}
      />
      <FieldNote
        message={errors.next || errors.reuse || fieldErrors?.password?.[0]}
      />

      <TextField
        icon="check-circle"
        placeholder="Confirm new password"
        secureTextEntry
        autoCapitalize="none"
        value={values.confirm}
        onChangeText={onChange(form.setConfirm)}
        onSubmitEditing={onSubmit}
        returnKeyType="go"
        editable={!loading}
      />
      <FieldNote message={errors.confirm} />

      <AuthButton label="Update Password" onPress={onSubmit} loading={loading} />
    </AuthLayout>
  );
};

const FieldNote = ({message}) =>
  message ? (
    <AppText size={11} color="#FFB4AC" style={styles.fieldNote}>
      {message}
    </AppText>
  ) : null;

const styles = ScaledSheet.create({
  intro: {marginBottom: '18@vs'},
  fieldNote: {marginTop: '-6@vs', marginBottom: '10@vs', marginLeft: '4@s'},
});

export default ChangePasswordScreen;
