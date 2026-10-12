import React, {useCallback, useEffect} from 'react';
import {View, ScrollView, RefreshControl} from 'react-native';

import {
  AppText,
  EmptyState,
  ErrorState,
  ForceUpdateDialog,
  HeroCard,
  HomeHeader,
  HomeSkeleton,
  MetricCard,
  MiniItem,
  Screen,
  SectionHead,
} from '../components';
import useForceUpdate from '../hooks/useForceUpdate';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {selectUser} from '../store/slices/authSlice';
import {
  fetchHome,
  selectHome,
  selectHeroState,
  selectHomeInitialLoading,
  selectScopeKey,
} from '../store/slices/dashboardSlice';
import {selectUnreadCount} from '../store/slices/notificationsSlice';
import {resetFilters} from '../store/slices/uiSlice';
import {categoryWord} from '../utils/category';
import {fmtTimeRemaining, greeting, plural} from '../utils/format';
import {ROUTES} from '../navigation/routes';
import {colors, alpha, ScaledSheet} from '../theme';

const HomeScreen = ({navigation}) => {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectUser);
  const {today, overdue, urgent, error, refreshing, status} = useAppSelector(selectHome);
  const hero = useAppSelector(selectHeroState);
  const initialLoading = useAppSelector(selectHomeInitialLoading);
  const scopeKey = useAppSelector(selectScopeKey);
  const unreadCount = useAppSelector(selectUnreadCount);
  const {updateRequired, storeVersion, openStore} = useForceUpdate();

  // Refetches when stale, and whenever the branch/dataset scope changes —
  // this screen stays mounted while the user visits other tabs.
  useEffect(() => {
    dispatch(fetchHome());
  }, [dispatch, scopeKey]);

  const onRefresh = useCallback(() => {
    dispatch(fetchHome({refresh: true}));
  }, [dispatch]);

  const go = useCallback(
    route => {
      dispatch(resetFilters());
      navigation.navigate(route);
    },
    [dispatch, navigation],
  );

  const openSample = useCallback(
    id => navigation.navigate(ROUTES.DETAIL, {id, from: ROUTES.HOME}),
    [navigation],
  );

  // The bell dot reflects real conditions rather than being always-on.
  const hasAlerts =
    (overdue?.total ?? 0) > 0 || (today?.past_deadline ?? 0) > 0;

  const header = (
    <HomeHeader
      user={user}
      greeting={greeting()}
      showDot={hasAlerts}
      unreadCount={unreadCount}
      onBellPress={() => go(ROUTES.ALERTS)}
    />
  );

  // Rendered on every branch below — the gate must hold whether the dashboard
  // loaded, failed, or is still fetching.
  const updateGate = (
    <ForceUpdateDialog
      visible={updateRequired}
      storeVersion={storeVersion}
      onUpdate={openStore}
    />
  );

  if (initialLoading) {
    return (
      <Screen backgroundColor={colors.paper} statusBarColor={colors.white}>
        {header}
        {updateGate}
        <HomeSkeleton />
      </Screen>
    );
  }

  if (status === 'failed' && !today) {
    return (
      <Screen backgroundColor={colors.paper} statusBarColor={colors.white}>
        {header}
        {updateGate}
        <ErrorState message={error} onRetry={onRefresh} />
      </Screen>
    );
  }

  return (
    <Screen backgroundColor={colors.paper} statusBarColor={colors.white}>
      {header}
      {updateGate}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.tealDeep]}
            tintColor={colors.tealDeep}
          />
        }>
        <HeroCard
          tone={hero.tone}
          eyebrow={hero.eyebrow}
          value={hero.value}
          onPress={() => go(hero.tone === 'crit' ? ROUTES.OVERDUE : ROUTES.TODAY)}>
          <AppText size={12.5} lineHeight={18} color={alpha.white90}>
            {hero.tone === 'crit' ? (
              <>
                samples past release date
                {hero.oldestDays !== null ? (
                  <AppText size={12.5} weight="bold" color={colors.yellow}>
                    {' '}
                    · oldest {plural(hero.oldestDays, 'day')}
                  </AppText>
                ) : null}
              </>
            ) : hero.tone === 'warn' ? (
              'samples due within the hour · push these first'
            ) : (
              'released today · zero pending in past overdue'
            )}
          </AppText>
        </HeroCard>

        <View style={styles.metrics}>
          <MetricCard
            label="TODAY'S TAT"
            value={today?.expected ?? 0}
            caption={`${today?.released ?? 0} done · ${today?.pending ?? 0} pending`}
            onPress={() => go(ROUTES.TODAY)}
          />
          <MetricCard
            label="DUE IN 1H"
            value={today?.due_within_1h ?? 0}
            tone={(today?.due_within_1h ?? 0) > 0 ? 'warn' : 'default'}
            caption={`${today?.critical ?? 0} crit priority`}
            onPress={() => go(ROUTES.TODAY)}
          />
        </View>

        {urgent.length > 0 ? (
          <>
            <SectionHead
              label="MOST URGENT"
              linkLabel="See all →"
              onLinkPress={() => go(ROUTES.TODAY)}
            />
            {urgent.map(sample => {
              const past = (sample.remaining_minutes ?? 0) < 0;
              return (
                <MiniItem
                  key={sample.id}
                  tone={past ? 'crit' : 'warn'}
                  code={sample.barcode}
                  title={sample.test_name}
                  meta={`${sample.branch} · ${categoryWord(sample.category)} · SLA ${
                    sample.std_tat_hours ?? '—'
                  }H`}
                  timeLabel={`${past ? '−' : ''}${fmtTimeRemaining(
                    sample.remaining_minutes ?? 0,
                  )}`}
                  timeSuffix={past ? 'OVER' : 'LEFT'}
                  onPress={() => openSample(sample.id)}
                />
              );
            })}
          </>
        ) : (
          <EmptyState
            compact
            icon="check"
            title="NOTHING URGENT"
            message="All pending samples have comfortable time buffers."
          />
        )}

        {overdue?.total > 0 ? (
          <AppText variant="mono" size={9.5} tracking={0.6} uppercase align="center" style={styles.footer}>
            {overdue.total} overdue · {overdue.aged_7plus} aged 7d+ ·{' '}
            {today?.completion_pct ?? 0}% released today
          </AppText>
        ) : null}
      </ScrollView>
    </Screen>
  );
};

const styles = ScaledSheet.create({
  scroll: {
    paddingHorizontal: '16@s',
    paddingTop: '14@vs',
    paddingBottom: '24@vs',
  },
  metrics: {flexDirection: 'row', gap: '10@s', marginTop: '14@vs'},
  footer: {marginTop: '18@vs'},
});

export default HomeScreen;
