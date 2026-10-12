import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';

import {API_BASE_URL, API_TIMEOUT, STORAGE_KEYS} from '../config';

/**
 * Shared axios instance for the Trust TAT API.
 *
 * The token is held in memory and mirrored to AsyncStorage, so requests do not
 * pay a storage read each time.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

let authToken = null;

/** Called when the server rejects our token — wired up by the store. */
let onUnauthorized = null;

export const setUnauthorizedHandler = handler => {
  onUnauthorized = handler;
};

export const setAuthToken = async token => {
  authToken = token;
  if (token) {
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
  } else {
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
  }
};

export const loadAuthToken = async () => {
  authToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  return authToken;
};

export const getAuthToken = () => authToken;

/**
 * A stable per-install identifier used as the Sanctum token name, so signing
 * in here never revokes the token on the user's other devices.
 */
export const getDeviceName = async () => {
  let id = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  if (!id) {
    id = `${Platform.OS}-${Math.random().toString(36).slice(2, 10)}`;
    await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, id);
  }
  return id;
};

api.interceptors.request.use(config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    // 401 means the token is gone or revoked server-side — drop it locally so
    // the app returns to sign-in rather than retrying forever.
    if (error?.response?.status === 401) {
      authToken = null;
      await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

/**
 * Turns an axios failure into a message worth showing a user, plus the API's
 * `code` and Laravel's field-level validation errors when present.
 */
export const parseApiError = error => {
  if (!error?.response) {
    return {
      message: 'Cannot reach the server. Check your connection and try again.',
      code: 'network_error',
      errors: {},
    };
  }

  const {status, data} = error.response;

  if (status === 422) {
    const errors = data?.errors ?? {};
    const first = Object.values(errors)[0];
    return {
      message: (Array.isArray(first) ? first[0] : first) || 'Please check the details you entered.',
      code: 'validation_error',
      errors,
    };
  }

  if (status === 429) {
    return {
      message: 'Too many attempts. Please wait a minute and try again.',
      code: 'rate_limited',
      errors: {},
    };
  }

  return {
    message: data?.message || 'Something went wrong. Please try again.',
    code: data?.code || `http_${status}`,
    errors: data?.errors ?? {},
  };
};

export default api;
