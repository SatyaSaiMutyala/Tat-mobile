import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, FlatList, ActivityIndicator, RefreshControl} from 'react-native';

import {
  AppBar,
  AppText,
  BucketFilterNote,
  BucketGrid,
  CarryBanner,
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
  fetchOverdueSummary,
  fetchSamples,
  selectList,
  selectOverdue,
  selectScopeKey,
  setListQuery,
} from '../store/slices/dashboardSlice';
import {selectUnreadCount} from '../store/slices/notificationsSlice';
import {selectUi, setOverdueChip, toggleOverdueBucket} from '../store/slices/uiSlice';
import {DAYS_LATE_BUCKET_COLORS, toGridBuckets} from '../utils/buckets';
import {plural} from '../utils/format';
import {ROUTES} from '../navigation/routes';
import {colors, ScaledSheet} from '../theme';

const SCOPE = 'overdue';

const CHIP_CATEGORY = {crit: 'critical', spec: 'specialised'};

const OverdueScreen = ({navigation}) => {
  const dispatch = useAppDispatch();

  const {kpis, buckets, chips, carryOver, oldest, status: summaryStatus, error: summaryError} =
    useAppSelector(selectOverdue);
  const list = useAppSelector(selectList(SCOPE));
  const unreadCount = useAppSelector(selectUnreadCount);
  const {overdueChip, overdueBucket} = useAppSelector(selectUi);

  const category = CHIP_CATEGORY[overdueChip];
  // "Aged 7d+" has no single bucket key, so it maps onto the 1w bucket when no
  // explicit bucket is chosen.
  const bucket = overdueBucket || (overdueChip === 'aged' ? '1w' : undefined);

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
    dispatch(fetchOverdueSummary());
  }, [dispatch, scopeKey]);

  useEffect(() => {
    dispatch(fetchSamples({scope: SCOPE, refresh: true, bucket, category}));
  }, [dispatch, bucket, category, scopeKey, list.query]);

  const onRefresh = useCallback(() => {
    dispatch(fetchOverdueSummary({refresh: true}));
    dispatch(fetchSamples({scope: SCOPE, refresh: true, bucket, category}));
  }, [dispatch, bucket, category]);

  const onEndReached = useCallback(() => {
    if (list.hasMore && list.status !== 'loading') {
      dispatch(fetchSamples({scope: SCOPE, bucket, category}));
    }
  }, [dispatch, list.hasMore, list.status, bucket, category]);

  const openSample = useCallback(
    id => navigation.navigate(ROUTES.DETAIL, {id, from: ROUTES.OVERDUE}),
    [navigation],
  );

  const gridBuckets = useMemo(
    () => toGridBuckets(buckets, DAYS_LATE_BUCKET_COLORS),
    [buckets],
  );
  const activeBucket = overdueBucket
    ? gridBuckets.find(b => b.key === overdueBucket)
    : null;

  const chipItems = useMemo(
    () => [
      {key: 'all', label: 'All', count: chips?.all ?? 0},
      {key: 'aged', label: 'Aged 7d+', count: chips?.aged ?? 0},
      {key: 'crit', label: 'Critical', count: chips?.critical ?? 0},
      {key: 'spec', label: 'Specialised', count: chips?.specialised ?? 0},
    ],
    [chips],
  );

  const renderItem = useCallback(
    ({item}) => (
      <View style={styles.rowWrap}>
        <SampleRow item={item} onOpen={openSample} variant="overdue" />
      </View>
    ),
    [openSample],
  );

  const keyExtractor = useCallback(item => String(item.id), []);

  const listHeader = useMemo(
    () => (
      <View style={styles.headerWrap}>
        {(kpis?.total ?? 0) > 0 ? (
          <CarryBanner>
            <AppText size={11} lineHeight={16} color={colors.ink2}>
              <AppText size={11} weight="extraBold" color={colors.crit}>
                {kpis.total} pending past release date.{' '}
              </AppText>
              {(kpis.aged_7plus ?? 0) > 0 ? (
                <AppText size={11} weight="extraBold" color={colors.crit}>
                  {kpis.aged_7plus} aged &gt; 7 days.{' '}
                </AppText>
              ) : null}
              {oldest ? (
                <AppText size={11} color={colors.ink2}>
                  Oldest: {oldest.barcode} ·{' '}
                  <AppText size={11} weight="extraBold" color={colors.crit}>
                    {plural(oldest.days_late ?? 0, 'day')}
                  </AppText>
                  .
                </AppText>
              ) : null}
            </AppText>
          </CarryBanner>
        ) : null}

        <BucketGrid
          buckets={gridBuckets}
          activeKey={overdueBucket}
          onToggle={key => dispatch(toggleOverdueBucket(key))}
        />

        {activeBucket ? (
          <BucketFilterNote
            label={activeBucket.label}
            count={activeBucket.count}
            onClear={() => dispatch(toggleOverdueBucket(activeBucket.key))}
          />
        ) : null}
      </View>
    ),
    [dispatch, gridBuckets, overdueBucket, activeBucket, kpis, oldest],
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
          {kpis?.total ?? 0} overdue · {carryOver?.aged_72h ?? 0} carried over 72h+
        </AppText>
      );
    }
    return null;
  }, [loadingMore, list.hasMore, list.items.length, kpis, carryOver]);

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
          message={`Nothing overdue matches “${list.query}”.`}
        />
      ) : (
        <EmptyState
          icon="check"
          title="NO PAST OVERDUE"
          message={'Nothing matches this filter.\nPrevious shifts have cleared their queues.'}
        />
      ),
    [firstLoad, list.query],
  );

  return (
    <Screen statusBarColor={colors.white}>
      <AppBar
        eyebrow="Missed release · carry-over"
        title={`Past Overdue · ${kpis?.total ?? 0}`}
        rightIcon="bell"
        rightBadge={unreadCount}
        onRightPress={() => navigation.navigate(ROUTES.ALERTS)}
      />

      <Chips
        items={chipItems}
        value={overdueChip}
        onChange={key => dispatch(setOverdueChip(key))}
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
          onEndReachedThreshold={1.2}
          refreshControl={
            <RefreshControl
              refreshing={list.refreshing}
              onRefresh={onRefresh}
              colors={[colors.tealDeep]}
              tintColor={colors.tealDeep}
            />
          }
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
  headerWrap: {paddingBottom: '10@vs'},
  rowWrap: {paddingHorizontal: '14@s'},
  footer: {paddingHorizontal: '24@s', paddingTop: '14@vs', paddingBottom: '10@vs'},
  footerLoader: {paddingVertical: '18@vs'},
});

export default OverdueScreen;
