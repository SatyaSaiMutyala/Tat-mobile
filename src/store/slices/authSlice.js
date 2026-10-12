import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  loginRequest,
  meRequest,
  logoutRequest,
  changePasswordRequest,
} from '../../services/authApi';
import {setAuthToken, loadAuthToken, parseApiError} from '../../services/api';
import {unregisterDevice} from '../../services/push';
import {STORAGE_KEYS} from '../../config';

const initialState = {
  user: null,
  isAuthenticated: false,
  /** Server says this account is still on a temporary password. */
  mustChangePassword: false,

  /** 'idle' | 'loading' | 'succeeded' | 'failed' */
  status: 'idle',
  error: null,
  /** Laravel field-level validation errors, keyed by field name. */
  fieldErrors: {},

  /** True until the persisted session has been checked on cold start. */
  bootstrapping: true,
};

/**
 * Cap on the cold-start session check. The splash screen is blocked until this
 * resolves, and a cached user is available, so it must fail fast.
 */
const SESSION_RESTORE_TIMEOUT = 8000;

const persistUser = async user => {
  await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

const clearSession = async () => {
  await setAuthToken(null);
  await AsyncStorage.removeItem(STORAGE_KEYS.USER);
};

/**
 * Cold start: load the stored token and confirm it is still valid.
 * A cached user is used for an instant first paint, then refreshed from /me.
 */
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, {rejectWithValue}) => {
    const token = await loadAuthToken();
    if (!token) {
      return {user: null};
    }

    try {
      const user = await meRequest({timeout: SESSION_RESTORE_TIMEOUT});
      await persistUser(user);
      return {user};
    } catch (error) {
      // 401 is handled by the api interceptor, which already cleared storage.
      const parsed = parseApiError(error);
      if (parsed.code === 'network_error') {
        // Offline — fall back to the cached user rather than signing out.
        const cached = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        if (cached) {
          return {user: JSON.parse(cached), offline: true};
        }
      }
      await clearSession();
      return rejectWithValue(parsed);
    }
  },
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, {rejectWithValue}) => {
    try {
      const {token, user} = await loginRequest(credentials);
      await setAuthToken(token);
      await persistUser(user);
      return {user};
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  },
);

export const signOut = createAsyncThunk('auth/signOut', async () => {
  // Drop the push registration first, while the token is still valid.
  await unregisterDevice();

  try {
    await logoutRequest();
  } catch {
    // Revoking server-side is best-effort — the local session goes either way.
  }
  await clearSession();
  return true;
});

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (payload, {rejectWithValue}) => {
    try {
      const {user} = await changePasswordRequest(payload);
      await persistUser(user);
      return {user};
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  },
);

const applyUser = (state, user) => {
  state.user = user;
  state.isAuthenticated = Boolean(user);
  state.mustChangePassword = Boolean(user?.must_change_password);
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: state => {
      state.error = null;
      state.fieldErrors = {};
    },
    /** Called by the API layer when the server rejects our token. */
    sessionExpired: () => ({...initialState, bootstrapping: false}),
  },
  extraReducers: builder => {
    builder
      .addCase(restoreSession.pending, state => {
        state.bootstrapping = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.bootstrapping = false;
        applyUser(state, action.payload.user);
      })
      .addCase(restoreSession.rejected, state => {
        state.bootstrapping = false;
        applyUser(state, null);
      })

      .addCase(login.pending, state => {
        state.status = 'loading';
        state.error = null;
        state.fieldErrors = {};
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        applyUser(state, action.payload.user);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Unable to sign in.';
        state.fieldErrors = action.payload?.errors || {};
      })

      .addCase(changePassword.pending, state => {
        state.status = 'loading';
        state.error = null;
        state.fieldErrors = {};
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.status = 'succeeded';
        applyUser(state, action.payload.user);
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Unable to update password.';
        state.fieldErrors = action.payload?.errors || {};
      })

      .addCase(signOut.fulfilled, () => ({
        ...initialState,
        bootstrapping: false,
      }));
  },
});

export const {clearAuthError, sessionExpired} = authSlice.actions;

export const selectUser = state => state.auth.user;
export const selectAuth = state => state.auth;
export const selectIsAuthenticated = state => state.auth.isAuthenticated;
export const selectBootstrapping = state => state.auth.bootstrapping;
export const selectMustChangePassword = state => state.auth.mustChangePassword;
export const selectBranchName = state => state.auth.user?.branch?.name ?? '—';
export const selectRoleLabel = state => state.auth.user?.role_label ?? '';

/** `can('export_csv')` — permission map comes straight from the API. */
export const selectCan = key => state =>
  Boolean(state.auth.user?.permissions?.[key]);

export default authSlice.reducer;
