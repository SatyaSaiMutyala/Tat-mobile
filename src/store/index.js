import {configureStore} from '@reduxjs/toolkit';

import authReducer, {sessionExpired} from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import notificationsReducer from './slices/notificationsSlice';
import uiReducer from './slices/uiSlice';
import {setUnauthorizedHandler} from '../services/api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    notifications: notificationsReducer,
    ui: uiReducer,
  },
  devTools: __DEV__,
});

// A 401 from any request drops the session, which sends the navigator back to
// sign-in. Registered here to keep the API layer free of store imports.
setUnauthorizedHandler(() => store.dispatch(sessionExpired()));

export default store;
