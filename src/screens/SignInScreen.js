import React, {useState} from 'react';
import {View} from 'react-native';

import {
  AppText,
  AuthButton,
  AuthLayout,
  FormError,
  TextField,
} from '../components';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {login, clearAuthError, selectAuth} from '../store/slices/authSlice';
import {alpha, ScaledSheet} from '../theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignInScreen = () => {
  const dispatch = useAppDispatch();
  const {status, error, fieldErrors} = useAppSelector(selectAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);

  const loading = status === 'loading';

  const emailError =
    touched && !EMAIL_RE.test(email.trim()) ? 'Enter a valid email address' : '';
  const passwordError = touched && !password ? 'Enter your password' : '';

  const onSubmit = () => {
    setTouched(true);
    if (!EMAIL_RE.test(email.trim()) || !password) {
      return;
    }
    dispatch(login({email, password}));
  };

  const onChange = setter => value => {
    if (error) {
      dispatch(clearAuthError());
    }
    setter(value);
  };

  return (
    <AuthLayout
      title="TRUST TAT"
      tagline="MOBILE · TL-OPS-TAT-003"
      footer={
        <AppText
          variant="mono"
          size={9}
          tracking={1.4}
          align="center"
          uppercase
          color={alpha.white35}>
          Approved for TrustLab staff
        </AppText>
      }>
      <FormError message={error} />

      <TextField
        icon="mail"
        placeholder="you@trustlab.in"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        value={email}
        onChangeText={onChange(setEmail)}
        editable={!loading}
      />
      <FieldNote message={emailError || fieldErrors?.email?.[0]} />

      <TextField
        icon="lock"
        placeholder="Password"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
        textContentType="password"
        value={password}
        onChangeText={onChange(setPassword)}
        onSubmitEditing={onSubmit}
        returnKeyType="go"
        editable={!loading}
      />
      <FieldNote message={passwordError || fieldErrors?.password?.[0]} />

      <AuthButton label="Sign In" onPress={onSubmit} loading={loading} />

      <View style={styles.note}>
        <AppText size={11} align="center" lineHeight={17} color={alpha.white55}>
          Use the same email and password as the Trust TAT dashboard.
        </AppText>
      </View>
    </AuthLayout>
  );
};

/** Inline validation line under a field. */
const FieldNote = ({message}) =>
  message ? (
    <AppText size={11} color="#FFB4AC" style={styles.fieldNote}>
      {message}
    </AppText>
  ) : null;

const styles = ScaledSheet.create({
  fieldNote: {marginTop: '-6@vs', marginBottom: '10@vs', marginLeft: '4@s'},
  note: {
    marginTop: '22@vs',
    paddingHorizontal: '14@s',
    paddingVertical: '12@vs',
    backgroundColor: alpha.white04,
    borderRadius: '10@ms',
    borderWidth: '1@ms',
    borderColor: alpha.white14,
    borderStyle: 'dashed',
  },
});

export default SignInScreen;
