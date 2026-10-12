import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, FlatList, ActivityIndicator, RefreshControl} from 'react-native';

import {
  AppBar,
  AppText,
  Chips,
  EmptyState,
  ErrorState,
  ListSkeleton,
  Screen,
  SearchBar,
  SlaRow,
} from '../components';
import useDebouncedValue from '../hooks/useDebouncedValue';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
  fetchSla,
  setSlaRange,
  setSlaQuery,
  selectSla,
  selectScopeKey,
} from '../store/slices/dashboardSlice';
import {colors, ScaledSheet} from '../theme';

const RANGES = [
  {key: '7', label: '7 days'},
  {key: '30', label: '30 days'},
  {key: '90', label: '90 days'},
];

const SlaScreen = ({navigation}) => {
  const dispatch = useAppDispatch();
  const sla = useAppSelector(selectSla);
  const scopeKey = useAppSelector(selectScopeKey);

  const [term, setTerm] = useState(sla.query);
  const settledTerm = useDebouncedValue(term);

  // Reload whenever the window, the search or the branch scope changes.
  useEffect(() => {
    dispatch(fetchSla({refresh: true}));
  }, [dispatch, sla.range, sla.query, scopeKey]);

  useEffect(() => {
    if (settledTerm !== sla.query) {
      dispatch(setSlaQuery(settledTerm));
    }
  }, [dispatch, settledTerm, sla.query]);

  const onRefresh = useCallback(
    () => dispatch(fetchSla({refresh: true})),
    [dispatch],
  );

  const onEndReached = useCallback(() => {
    if (sla.hasMore && sla.status !== 'loading') {
      dispatch(fetchSla());
    }
  }, [dispatch, sla.hasMore, sla.status]);

  const renderItem = useCallback(({item}) => <SlaRow item={item} />, []);
  const keyExtractor = useCallback(item => item.code, []);

  const summary = sla.summary;

  const listHeader = useMemo(
    () => (
      <View style={styles.header}>
        <SearchBar
          value={term}
          onChangeText={setTerm}
          placeholder="Search test, code or department"
        />

        {summary ? (
          <View style={styles.summary}>
            <Stat label="Tests" value={summary.tests} />
            <Stat label="On track" value={summary.on_track} color={colors.ok} />
            <Stat label="At risk" value={summary.at_risk} color={colors.warn} />
            <Stat label="Breaching" value={summary.breaching} color={colors.crit} />
          </View>
        ) : null}
      </View>
    ),
    [term, summary],
  );

  const loadingMore =
    sla.status === 'loading' && sla.rows.length > 0 && !sla.refreshing;

  const listFooter = useMemo(() => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={colors.tealDeep} />
        </View>
      );
    }
    if (!sla.hasMore && sla.rows.length > 0) {
      return (
        <AppText variant="mono" size={10} tracking={0.5} align="center" uppercase style={styles.footer}>
          {sla.rows.length} test{sla.rows.length === 1 ? '' : 's'} · ranked by volume
        </AppText>
      );
    }
    return null;
  }, [loadingMore, sla.hasMore, sla.rows.length]);

  const firstLoad = sla.status === 'loading' && sla.rows.length === 0;

  return (
    <Screen edges={['top', 'bottom']} statusBarColor={colors.white}>
      <AppBar
        eyebrow="Std TAT vs achieved"
        title="SLA Catalogue"
        onBack={() => navigation.goBack()}
      />

      <Chips
        items={RANGES}
        value={sla.range}
        onChange={key => dispatch(setSlaRange(key))}
      />

      {sla.status === 'failed' && sla.rows.length === 0 ? (
        <ErrorState message={sla.error} onRetry={onRefresh} />
      ) : (
        <FlatList
          data={sla.rows}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={listHeader}
          ListFooterComponent={listFooter}
          ListEmptyComponent={
            firstLoad ? (
              <ListSkeleton rows={4} />
            ) : (
              <EmptyState
                tone="muted"
                icon="search"
                title="NO TESTS FOUND"
                message={
                  sla.query
                    ? `Nothing matches “${sla.query}” in this window.`
                    : 'No tests have samples in this date range.'
                }
              />
            )
          }
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onEndReached={onEndReached}
          onEndReachedThreshold={1.2}
          refreshControl={
            <RefreshControl
              refreshing={sla.refreshing}
              onRefresh={onRefresh}
              colors={[colors.tealDeep]}
              tintColor={colors.tealDeep}
            />
          }
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={15}
        />
      )}
    </Screen>
  );
};

const Stat = ({label, value, color}) => (
  <View style={styles.stat}>
    <AppText variant="display" size={18} tracking={0.5} color={color || colors.greenDeep}>
      {value}
    </AppText>
    <AppText variant="mono" size={8.5} tracking={0.6} uppercase style={styles.statLabel}>
      {label}
    </AppText>
  </View>
);

const styles = ScaledSheet.create({
  content: {paddingHorizontal: '14@s', paddingBottom: '24@vs'},
  header: {paddingTop: '12@vs', paddingBottom: '6@vs'},
  summary: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderWidth: '1@ms',
    borderColor: colors.line,
    borderRadius: '12@ms',
    paddingVertical: '12@vs',
    marginTop: '10@vs',
    marginBottom: '4@vs',
  },
  stat: {flex: 1, alignItems: 'center'},
  statLabel: {marginTop: '3@vs'},
  footer: {paddingTop: '14@vs', paddingBottom: '8@vs'},
  footerLoader: {paddingVertical: '18@vs'},
});

export default SlaScreen;
