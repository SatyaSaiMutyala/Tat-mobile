import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, FlatList, ActivityIndicator, RefreshControl} from 'react-native';

import {
  AppBar,
  AppText,
  BucketFilterNote,
  BucketGrid,
  Chips,
  EmptyState,
  ErrorState,
  ListSkeleton,
  SampleRow,
  Screen,
  SearchBar,
} from '../components';
import useDebouncedValue from '../hooks/useDebouncedValue';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
  fetchSamples,
  fetchTodaySummary,
  selectList,
  selectScopeKey,
  selectToday,
  setListQuery,
} from '../store/slices/dashboardSlice';
import {selectUnreadCount} from '../store/slices/notificationsSlice';
import {selectUi, setTodayChip, toggleTodayBucket} from '../store/slices/uiSlice';
import {toGridBuckets} from '../utils/buckets';
import {ROUTES} from '../navigation/routes';
import {colors, ScaledSheet} from '../theme';

const SCOPE = 'today';

/** Chip key -> the API's category filter. */
const CHIP_CATEGORY = {crit: 'critical', spec: 'specialised'};

const TodayScreen = ({navigation}) => {
  const dispatch = useAppDispatch();

  const {kpis, buckets, chips, status: summaryStatus, error: summaryError} =
    useAppSelector(selectToday);
  const list = useAppSelector(selectList(SCOPE));
  const unreadCount = useAppSelector(selectUnreadCount);
  const {todayChip, todayBucket} = useAppSelector(selectUi);

  // Chips filter by category (or past-due); the strip drills by deadline
  // window. An explicit bucket selection wins over the "past due" chip.
  const category = CHIP_CATEGORY[todayChip];
  const bucket = todayBucket || (todayChip === 'past' ? 'past' : undefined);

  const scopeKey = useAppSelector(selectScopeKey);

  // Local while typing; committed to the store once it settles.
  const [term, setTerm] = useState(list.query);
  const settledTerm = useDebouncedValue(term);

  useEffect(() => {
    if (settledTerm !== list.query) {
      dispatch(setListQuery({scope: SCOPE, query: settledTerm}));
    }
  }, [dispatch, settledTerm, list.query]);

  useEffect(() => {
    dispatch(fetchTodaySummary());
  }, [dispatch, scopeKey]);

  // Any filter, search or scope change restarts the list at page 1.
  useEffect(() => {
    dispatch(fetchSamples({scope: SCOPE, refresh: true, bucket, category}));
  }, [dispatch, bucket, category, scopeKey, list.query]);

  const onRefresh = useCallback(() => {
    dispatch(fetchTodaySummary({refresh: true}));
    dispatch(fetchSamples({scope: SCOPE, refresh: true, bucket, category}));
  }, [dispatch, bucket, category]);

  const onEndReached = useCallback(() => {
    if (list.hasMore && list.status !== 'loading') {
      dispatch(fetchSamples({scope: SCOPE, bucket, category}));
    }
  }, [dispatch, list.hasMore, list.status, bucket, category]);

  const openSample = useCallback(
    id => navigation.navigate(ROUTES.DETAIL, {id, from: ROUTES.TODAY}),
    [navigation],
  );

  const gridBuckets = useMemo(() => toGridBuckets(buckets), [buckets]);
  const activeBucket = todayBucket
    ? gridBuckets.find(b => b.key === todayBucket)
    : null;

  const chipItems = useMemo(
    () => [
      {key: 'all', label: 'All', count: chips?.all ?? 0},
      {key: 'past', label: 'Past due', count: chips?.past_due ?? 0},
      {key: 'crit', label: 'Critical', count: chips?.critical ?? 0},
      {key: 'spec', label: 'Specialised', count: chips?.specialised ?? 0},
    ],
    [chips],
  );

  // The gutter lives on a per-row wrapper rather than the content container,
  // so the bucket strip and the filter note keep their own full-bleed layout.
  const renderItem = useCallback(
    ({item}) => (
      <View style={styles.rowWrap}>
        <SampleRow item={item} onOpen={openSample} />
      </View>
    ),
    [openSample],
  );

  const keyExtractor = useCallback(item => String(item.id), []);

  // Memoised elements — an inline JSX header would remount the 11-tile bucket
  // strip on every render, including each pagination append.
  const listHeader = useMemo(
    () => (
      <View style={styles.headerWrap}>
        <BucketGrid
          buckets={gridBuckets}
          activeKey={todayBucket}
          onToggle={key => dispatch(toggleTodayBucket(key))}
        />
        {activeBucket ? (
          <BucketFilterNote
            label={activeBucket.label}
            count={activeBucket.count}
            onClear={() => dispatch(toggleTodayBucket(activeBucket.key))}
          />
        ) : null}
      </View>
    ),
    [dispatch, gridBuckets, todayBucket, activeBucket],
  );

  const loadingMore =
    list.status === 'loading' && list.items.length > 0 && !list.refreshing;

  const listFooter = useMemo(() => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={colors.tealDeep} />
        </View>
      );
    }
    if (!list.hasMore && list.items.length > 0) {
      return (
        <AppText variant="mono" size={10} tracking={0.5} align="center" uppercase style={styles.footer}>
          {kpis?.released ?? 0} released · {kpis?.pending ?? 0} pending ·{' '}
          {kpis?.expected ?? 0} total today
        </AppText>
      );
    }
    return null;
  }, [loadingMore, list.hasMore, list.items.length, kpis]);

  const firstLoad = list.status === 'loading' && list.items.length === 0;
  const failedEmpty = list.status === 'failed' && list.items.length === 0;

  const listEmpty = useMemo(
    () =>
      firstLoad ? (
        <ListSkeleton />
      ) : list.query ? (
        <EmptyState
          tone="muted"
          icon="search"
          title="NO MATCHES"
          message={`Nothing in today's queue matches “${list.query}”.`}
        />
      ) : (
        <EmptyState
          icon="check"
          title="NO PENDING SAMPLES"
          message={`Nothing pending in this filter.\n${
            kpis?.released ?? 0
          } already released today.`}
        />
      ),
    [firstLoad, kpis, list.query],
  );

  return (
    <Screen statusBarColor={colors.white}>
      <AppBar
        eyebrow="CSD daily · release queue"
        title="TODAY'S TAT"
        rightIcon="bell"
        rightBadge={unreadCount}
        onRightPress={() => navigation.navigate(ROUTES.ALERTS)}
      />

      <Chips
        items={chipItems}
        value={todayChip}
        onChange={key => dispatch(setTodayChip(key))}
        divider={false}
      />

      {/* Outside the FlatList on purpose: a TextInput inside
          ListHeaderComponent loses focus when the header re-renders. */}
      <View style={styles.searchWrap}>
        <SearchBar
          value={term}
          onChangeText={setTerm}
          placeholder="Search barcode, patient or test"
        />
      </View>

      {failedEmpty || (summaryStatus === 'failed' && !kpis) ? (
        <ErrorState message={list.error || summaryError} onRetry={onRefresh} />
      ) : (
        <FlatList
          data={list.items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={listHeader}
          ListFooterComponent={listFooter}
          ListEmptyComponent={listEmpty}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onEndReached={onEndReached}
          // Prefetch early so the next page is usually there before the user
          // reaches the bottom.
          onEndReachedThreshold={1.2}
          refreshControl={
            <RefreshControl
              refreshing={list.refreshing}
              onRefresh={onRefresh}
              colors={[colors.tealDeep]}
              tintColor={colors.tealDeep}
            />
          }
          // NOTE: removeClippedSubviews is deliberately NOT set. On Android it
          // detaches off-screen rows and frequently fails to re-attach them,
          // leaving blank gaps when scrolling back up.
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          updateCellsBatchingPeriod={60}
          windowSize={21}
        />
      )}
    </Screen>
  );
};

const styles = ScaledSheet.create({
  content: {paddingBottom: '20@vs'},
  searchWrap: {paddingHorizontal: '14@s', paddingBottom: '10@vs'},
  // Separates the bucket strip from the first card.
  headerWrap: {paddingBottom: '10@vs'},
  rowWrap: {paddingHorizontal: '14@s'},
  footer: {paddingHorizontal: '24@s', paddingTop: '14@vs', paddingBottom: '10@vs'},
  footerLoader: {paddingVertical: '18@vs'},
});

export default TodayScreen;
