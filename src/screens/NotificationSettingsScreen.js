import React, {useCallback, useEffect, useState} from 'react';
import {View, ScrollView} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import {
  AppBar,
  AppText,
  ErrorState,
  GroupTitle,
  ListSkeleton,
  Screen,
  SettingRow,
} from '../components';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
  fetchNotificationPrefs,
  selectNotificationPrefs,
  updateNotificationPrefs,
} from '../store/slices/notificationsSlice';
import {colors, ScaledSheet} from '../theme';

/** "HH:MM" -> a Date today, for the native picker. */
const toDate = value => {
  const [h, m] = (value || '22:00').split(':').map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
};

const toHHMM = date =>
  `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;

const DEFAULT_QUIET = {from: '22:00', to: '07:00'};

const NotificationSettingsScreen = ({navigation}) => {
  const dispatch = useAppDispatch();
  const {values, status, saving, error} = useAppSelector(selectNotificationPrefs);

  // 'from' | 'to' | null — which bound the native picker is editing.
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    dispatch(fetchNotificationPrefs());
  }, [dispatch]);

  const save = useCallback(
    patch => dispatch(updateNotificationPrefs(patch)),
    [dispatch],
  );

  const quietOn = Boolean(values?.quiet_from && values?.quiet_to);

  const onToggleQuiet = enabled =>
    save(
      enabled
        ? {quiet_from: DEFAULT_QUIET.from, quiet_to: DEFAULT_QUIET.to}
        : {quiet_from: null, quiet_to: null},
    );

  const onPickTime = (event, date) => {
    const which = editing;
    setEditing(null);

    // Android fires 'dismissed' on cancel; nothing to save then.
    if (!date || event?.type === 'dismissed' || !which) {
      return;
    }

    save(which === 'from' ? {quiet_from: toHHMM(date)} : {quiet_to: toHHMM(date)});
  };

  if (status === 'failed' && !values) {
    return (
      <Screen statusBarColor={colors.white}>
        <AppBar
          eyebrow="Preferences"
          title="NOTIFICATIONS"
          onBack={() => navigation.goBack()}
        />
        <ErrorState
          message={error}
          onRetry={() => dispatch(fetchNotificationPrefs())}
        />
      </Screen>
    );
  }

  return (
    <Screen backgroundColor={colors.paper} statusBarColor={colors.white}>
      <AppBar
        eyebrow="Preferences"
        title="NOTIFICATIONS"
        onBack={() => navigation.goBack()}
      />

      {!values ? (
        <ListSkeleton rows={4} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.group}>
            <GroupTitle>PUSH</GroupTitle>
            <SettingRow
              icon="notifications-outline"
              label="Push notifications"
              caption="Alerts on this device"
              value={values.push_enabled}
              onValueChange={v => save({push_enabled: v})}
              disabled={saving}
            />
          </View>

          <View style={styles.group}>
            <GroupTitle>WHAT TO ALERT ME ABOUT</GroupTitle>
            <SettingRow
              icon="alert-circle-outline"
              label="Critical past release"
              caption="Critical samples past their release date"
              value={values.critical_overdue}
              onValueChange={v => save({critical_overdue: v})}
              disabled={saving}
            />
            <SettingRow
              icon="time-outline"
              label="Past deadline"
              caption="Today's queue when a deadline is missed"
              value={values.past_deadline}
              onValueChange={v => save({past_deadline: v})}
              disabled={saving}
            />
            <AppText size={11} lineHeight={17} color={colors.ink3} style={styles.note}>
              Switching one off stops it being created at all — it will not sit
              unread in Alerts either.
            </AppText>
          </View>

          <View style={styles.group}>
            <GroupTitle>QUIET HOURS</GroupTitle>
            <SettingRow
              icon="moon-outline"
              label="Quiet hours"
              caption="Silence pushes overnight"
              value={quietOn}
              onValueChange={onToggleQuiet}
              disabled={saving || !values.push_enabled}
            />

            {quietOn ? (
              <>
                <SettingRow
                  label="From"
                  hint={values.quiet_from}
                  onPress={() => setEditing('from')}
                  disabled={saving}
                />
                <SettingRow
                  label="Until"
                  hint={values.quiet_to}
                  onPress={() => setEditing('to')}
                  disabled={saving}
                />
              </>
            ) : null}

            <AppText size={11} lineHeight={17} color={colors.ink3} style={styles.note}>
              Alerts raised during quiet hours are still saved — they just do
              not light up your phone.
            </AppText>
          </View>

          {error ? (
            <AppText size={11.5} color={colors.crit} style={styles.error}>
              {error}
            </AppText>
          ) : null}
        </ScrollView>
      )}

      {editing ? (
        <DateTimePicker
          value={toDate(editing === 'from' ? values.quiet_from : values.quiet_to)}
          mode="time"
          is24Hour
          onChange={onPickTime}
        />
      ) : null}
    </Screen>
  );
};

const styles = ScaledSheet.create({
  content: {paddingHorizontal: '14@s', paddingTop: '12@vs', paddingBottom: '28@vs'},
  group: {marginBottom: '18@vs'},
  note: {marginTop: '2@vs', marginHorizontal: '4@s'},
  error: {marginHorizontal: '4@s'},
});

export default NotificationSettingsScreen;
