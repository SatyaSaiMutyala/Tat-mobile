import React, {useCallback, useEffect, useMemo} from 'react';
import {View, FlatList, ActivityIndicator, RefreshControl} from 'react-native';

import {
  AlertRow,
  AppBar,
  AppText,
  Chips,
  EmptyState,
  ErrorState,
  ListSkeleton,
  Screen,
} from '../components';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  selectNotifications,
} from '../store/slices/notificationsSlice';
import {fmtRelative} from '../utils/format';
import {ROUTES} from '../navigation/routes';
import {colors, ScaledSheet} from '../theme';

/** Server severity -> AlertRow kind. */
const KIND = {critical: 'crit', warning: 'warn', info: 'info'};

const FILTERS = [
  {key: 'all', label: 'All'},
  {key: 'unread', label: 'Unread'},
  {key: 'critical', label: 'Critical'},
];

const AlertsScreen = ({navigation}) => {
  const dispatch = useAppDispatch();
  const {items, unreadCount, hasMore, status, error, refreshing} =
    useAppSelector(selectNotifications);

  const [filter, setFilter] = React.useState('all');

  useEffect(() => {
    dispatch(fetchNotifications({refresh: true}));
  }, [dispatch]);

  const onRefresh = useCallback(
    () => dispatch(fetchNotifications({refresh: true})),
    [dispatch],
  );

  const onEndReached = useCallback(() => {
    if (hasMore && status !== 'loading') {
      dispatch(fetchNotifications());
    }
  }, [dispatch, hasMore, status]);

  const onOpen = useCallback(
    item => {
      if (!item.read) {
        dispatch(markNotificationRead(item.id));
      }
      if (item.sample_id) {
        navigation.navigate(ROUTES.DETAIL, {
          id: item.sample_id,
          from: ROUTES.ALERTS,
        });
      }
    },
    [dispatch, navigation],
  );

  const filtered = useMemo(() => {
    if (filter === 'unread') {
      return items.filter(n => !n.read);
    }
    if (filter === 'critical') {
      return items.filter(n => n.severity === 'critical');
    }
    return items;
  }, [items, filter]);

  const chipItems = useMemo(
    () => [
      {...FILTERS[0], count: items.length},
      {...FILTERS[1], count: unreadCount},
      {...FILTERS[2], count: items.filter(n => n.severity === 'critical').length},
    ],
    [items, unreadCount],
  );

  const renderItem = useCallback(
    ({item}) => (
      <View style={styles.rowWrap}>
        <AlertRow
          kind={KIND[item.severity] || 'info'}
          unread={!item.read}
          title={item.title}
          time={fmtRelative(item.at ? new Date(item.at).getTime() : null)}
          onPress={() => onOpen(item)}>
          <AppText size={11.5} lineHeight={16} color={colors.ink3}>
            {item.barcode ? (
              <AppText variant="mono" size={11.5} weight="bold" color={colors.greenDeep}>
                {item.barcode}
              </AppText>
            ) : null}
            {item.barcode ? ' · ' : ''}
            {item.body}
          </AppText>
        </AlertRow>
      </View>
    ),
    [onOpen],
  );

  const keyExtractor = useCallback(item => String(item.id), []);

  const loadingMore = status === 'loading' && items.length > 0 && !refreshing;

  const listFooter = useMemo(() => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={colors.tealDeep} />
        </View>
      );
    }
    return null;
  }, [loadingMore]);

  const firstLoad = status === 'loading' && items.length === 0;

  if (status === 'failed' && items.length === 0) {
    return (
      <Screen statusBarColor={colors.white}>
        <AppBar eyebrow="Notifications" title="Alerts" />
        <ErrorState message={error} onRetry={onRefresh} />
      </Screen>
    );
  }

  return (
    <Screen statusBarColor={colors.white}>
      <AppBar
        eyebrow={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        title="Alerts"
        rightIcon={unreadCount > 0 ? 'check-circle' : undefined}
        onRightPress={
          unreadCount > 0 ? () => dispatch(markAllNotificationsRead()) : undefined
        }
      />

      <Chips items={chipItems} value={filter} onChange={setFilter} />

      {firstLoad ? (
        <ListSkeleton rows={5} />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListFooterComponent={listFooter}
          ListEmptyComponent={
            <EmptyState
              icon="check"
              title={filter === 'unread' ? 'NOTHING UNREAD' : 'NO ALERTS'}
              message={
                filter === 'unread'
                  ? 'You have read everything.'
                  : 'Nothing has needed your attention yet.'
              }
            />
          }
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onEndReached={onEndReached}
          onEndReachedThreshold={1.2}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.tealDeep]}
              tintColor={colors.tealDeep}
            />
          }
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          windowSize={15}
        />
      )}
    </Screen>
  );
};

const styles = ScaledSheet.create({
  content: {paddingTop: '10@vs', paddingBottom: '24@vs'},
  rowWrap: {paddingHorizontal: '14@s'},
  footerLoader: {paddingVertical: '18@vs'},
});

export default AlertsScreen;
