import api from './api';

/** GET /notifications — stored notifications plus the unread count. */
export const fetchNotificationsRequest = async ({page = 1, perPage = 25, unread} = {}) => {
  const {data} = await api.get('/notifications', {
    params: {page, per_page: perPage, unread: unread ? 1 : undefined},
  });
  return data;
};

/** POST /notifications/{id}/read — returns the new unread count. */
export const markNotificationReadRequest = async id => {
  const {data} = await api.post(`/notifications/${id}/read`);
  return data;
};

/** POST /notifications/read-all */
export const markAllNotificationsReadRequest = async () => {
  const {data} = await api.post('/notifications/read-all');
  return data;
};

/** GET /notifications/preferences */
export const fetchNotificationPrefsRequest = async () => {
  const {data} = await api.get('/notifications/preferences');
  return data.preferences;
};

/** PUT /notifications/preferences — partial; send only what changed. */
export const updateNotificationPrefsRequest = async patch => {
  const {data} = await api.put('/notifications/preferences', patch);
  return data.preferences;
};

/** POST /devices — associate this install's FCM token with the current user. */
export const registerDeviceRequest = async payload => {
  const {data} = await api.post('/devices', payload);
  return data;
};

/** DELETE /devices — stop this handset receiving the user's pushes. */
export const unregisterDeviceRequest = async token => {
  const {data} = await api.delete('/devices', {data: {token}});
  return data;
};
