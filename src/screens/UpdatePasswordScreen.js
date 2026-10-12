import React, {useEffect} from 'react';
import {View, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import {
  AppBar,
  AppText,
  FormError,
  PrimaryAction,
  Screen,
  TextField,
} from '../components';
import usePasswordForm, {MIN_PASSWORD_LENGTH} from '../hooks/usePasswordForm';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
  changePassword,
  clearAuthError,
  selectAuth,
} from '../store/slices/authSlice';
import {showToast} from '../store/slices/uiSlice';
import {colors, ms, ScaledSheet} from '../theme';

/**
 * Voluntary password change, reached from More. The forced version after a temp
 * password is `ChangePasswordScreen`; both share `usePasswordForm` so the rules
 * cannot drift apart.
 */
const UpdatePasswordScreen = ({navigation}) => {
  const dispatch = useAppDispatch();
  const {status, error, fieldErrors, user} = useAppSelector(selectAuth);

  const form = usePasswordForm();
  const {values, errors, valid} = form;

  const loading = status === 'loading';

  // A failed attempt on another screen must not greet the user with a red bar.
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const onSubmit = async () => {
    form.setTouched(true);
    if (!valid || loading) {
      return;
    }

    const result = await dispatch(changePassword(form.payload));

    if (changePassword.fulfilled.match(result)) {
      form.reset();
      dispatch(showToast('Password updated'));
      navigation.goBack();
    }
  };

  const onChange = setter => value => {
    if (error) {
      dispatch(clearAuthError());
    }
    setter(value);
  };

  return (
    <Screen statusBarColor={colors.white}>
      <AppBar
        eyebrow="Account · security"
        title="CHANGE PASSWORD"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <AppText size={12.5} lineHeight={19} color={colors.ink3}>
              Updating the password for{' '}
              <AppText size={12.5} weight="bold" color={colors.ink}>
                {user?.email}
              </AppText>
              . You will stay signed in on this device — every other session is
              signed out.
            </AppText>
          </View>

          <FormError message={error} />

          <TextField
            tone="light"
            icon="lock"
            placeholder="Current password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            value={values.current}
            onChangeText={onChange(form.setCurrent)}
            editable={!loading}
          />
          <FieldNote message={errors.current || fieldErrors?.current_password?.[0]} />

          <TextField
            tone="light"
            icon="key"
            placeholder="New password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            value={values.next}
            onChangeText={onChange(form.setNext)}
            editable={!loading}
          />
          <FieldNote
            message={errors.next || errors.reuse || fieldErrors?.password?.[0]}
          />

          <TextField
            tone="light"
            icon="check-circle"
            placeholder="Confirm new password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            value={values.confirm}
            onChangeText={onChange(form.setConfirm)}
            onSubmitEditing={onSubmit}
            returnKeyType="go"
            editable={!loading}
          />
          <FieldNote message={errors.confirm} />

          <View style={styles.hint}>
            <Feather name="shield" size={ms(13)} color={colors.ink3} />
            <AppText size={11.5} lineHeight={17} color={colors.ink3} style={styles.flex}>
              At least {MIN_PASSWORD_LENGTH} characters, and different from your
              current password.
            </AppText>
          </View>

          <PrimaryAction
            tone="ok"
            label="Update Password"
            onPress={onSubmit}
            loading={loading}
            style={styles.submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const FieldNote = ({message}) =>
  message ? (
    <AppText size={11} color={colors.crit} style={styles.fieldNote}>
      {message}
    </AppText>
  ) : null;

const styles = ScaledSheet.create({
  flex: {flex: 1},
  content: {paddingHorizontal: '16@s', paddingTop: '16@vs', paddingBottom: '28@vs'},
  intro: {marginBottom: '18@vs'},
  fieldNote: {marginTop: '-6@vs', marginBottom: '10@vs', marginLeft: '4@s'},
  hint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '8@s',
    marginTop: '4@vs',
    marginBottom: '20@vs',
  },
  submit: {alignSelf: 'stretch'},
});

export default UpdatePasswordScreen;
