import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';

import {
  fetchNotificationsRequest,
  fetchNotificationPrefsRequest,
  markNotificationReadRequest,
  markAllNotificationsReadRequest,
  updateNotificationPrefsRequest,
} from '../../services/notificationsApi';
import {parseApiError} from '../../services/api';

const initialState = {
  items: [],
  unreadCount: 0,
  page: 0,
  hasMore: true,
  status: 'idle',
  error: null,
  refreshing: false,

  /** Per-user notification settings. `values` is null until first loaded. */
  prefs: {
    values: null,
    /** Snapshot held during an optimistic save, for rollback on failure. */
    previous: null,
    status: 'idle',
    saving: false,
    error: null,
  },
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async ({refresh = false} = {}, {getState, rejectWithValue}) => {
    const state = getState().notifications;
    const page = refresh ? 1 : state.page + 1;

    try {
      const data = await fetchNotificationsRequest({page});
      return {data, refresh, page};
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  },
  {
    condition: ({refresh = false} = {}, {getState}) => {
      const {status, hasMore} = getState().notifications;
      if (status === 'loading') {
        return false;
      }
      return refresh || hasMore;
    },
  },
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, {rejectWithValue}) => {
    try {
      const data = await markNotificationReadRequest(id);
      return {id, unreadCount: data.unread_count};
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  },
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, {rejectWithValue}) => {
    try {
      await markAllNotificationsReadRequest();
      return true;
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  },
);

export const fetchNotificationPrefs = createAsyncThunk(
  'notifications/fetchPrefs',
  async (_, {rejectWithValue}) => {
    try {
      return await fetchNotificationPrefsRequest();
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  },
  {
    condition: (_, {getState}) =>
      getState().notifications.prefs.status !== 'loading',
  },
);

/**
 * Saves a partial change. The reducer applies it optimistically so the switch
 * moves under the finger, and rolls back if the request fails.
 */
export const updateNotificationPrefs = createAsyncThunk(
  'notifications/updatePrefs',
  async (patch, {rejectWithValue}) => {
    try {
      return await updateNotificationPrefsRequest(patch);
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  },
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    /** A push arrived while the app was open — refresh on next read. */
    invalidate: state => {
      state.hasMore = true;
      state.page = 0;
    },
    reset: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchNotifications.pending, (state, action) => {
        state.status = 'loading';
        state.refreshing = Boolean(action.meta.arg?.refresh);
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const {data, refresh, page} = action.payload;
        state.status = 'succeeded';
        state.refreshing = false;
        state.page = page;
        state.hasMore = Boolean(data.meta?.has_more);
        state.unreadCount = data.unread_count ?? 0;
        state.items = refresh ? data.data : [...state.items, ...data.data];
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.refreshing = false;
        state.error = action.payload?.message || 'Unable to load notifications.';
      })

      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const row = state.items.find(n => n.id === action.payload.id);
        if (row) {
          row.read = true;
        }
        state.unreadCount = action.payload.unreadCount ?? 0;
      })

      .addCase(markAllNotificationsRead.fulfilled, state => {
        state.items.forEach(n => {
          n.read = true;
        });
        state.unreadCount = 0;
      })

      .addCase(fetchNotificationPrefs.pending, state => {
        state.prefs.status = 'loading';
        state.prefs.error = null;
      })
      .addCase(fetchNotificationPrefs.fulfilled, (state, action) => {
        state.prefs.status = 'succeeded';
        state.prefs.values = action.payload;
      })
      .addCase(fetchNotificationPrefs.rejected, (state, action) => {
        state.prefs.status = 'failed';
        state.prefs.error =
          action.payload?.message || 'Unable to load notification settings.';
      })

      .addCase(updateNotificationPrefs.pending, (state, action) => {
        state.prefs.saving = true;
        state.prefs.error = null;
        // Optimistic: move the switch now, reconcile with the server below.
        if (state.prefs.values) {
          state.prefs.previous = {...state.prefs.values};
          state.prefs.values = {...state.prefs.values, ...action.meta.arg};
        }
      })
      .addCase(updateNotificationPrefs.fulfilled, (state, action) => {
        state.prefs.saving = false;
        state.prefs.previous = null;
        // The server is authoritative — it clears a one-sided quiet window.
        state.prefs.values = action.payload;
      })
      .addCase(updateNotificationPrefs.rejected, (state, action) => {
        state.prefs.saving = false;
        if (state.prefs.previous) {
          state.prefs.values = state.prefs.previous;
          state.prefs.previous = null;
        }
        state.prefs.error =
          action.payload?.message || 'Could not save that change.';
      });
  },
});

export const {invalidate, reset} = notificationsSlice.actions;

export const selectNotifications = state => state.notifications;
export const selectUnreadCount = state => state.notifications.unreadCount;
export const selectNotificationPrefs = state => state.notifications.prefs;

export default notificationsSlice.reducer;
