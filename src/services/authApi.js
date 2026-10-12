import api, {getDeviceName} from './api';

/** POST /login — returns {token, user}. */
export const loginRequest = async ({email, password}) => {
  const deviceName = await getDeviceName();
  const {data} = await api.post('/login', {
    email: email.trim(),
    password,
    device_name: deviceName,
  });
  return data;
};

/**
 * GET /me — returns {user}. Used to validate a restored token.
 *
 * Short timeout: this runs on the splash screen and there is a cached user to
 * fall back on, so a slow network must not hold the app hostage.
 */
export const meRequest = async ({timeout} = {}) => {
  const {data} = await api.get('/me', timeout ? {timeout} : undefined);
  return data.user;
};

/** POST /logout — revokes this device's token only. */
export const logoutRequest = async () => {
  const {data} = await api.post('/logout');
  return data;
};

/** POST /password/change — returns {message, user}. */
export const changePasswordRequest = async ({
  currentPassword,
  password,
  passwordConfirmation,
}) => {
  const {data} = await api.post('/password/change', {
    current_password: currentPassword,
    password,
    password_confirmation: passwordConfirmation,
  });
  return data;
};
