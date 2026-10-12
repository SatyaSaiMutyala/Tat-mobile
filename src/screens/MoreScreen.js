import React, {useEffect, useState} from 'react';
import {View, ScrollView} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {
  AppBar,
  AppText,
  Avatar,
  BranchPicker,
  ConfirmDialog,
  GroupTitle,
  MoreItem,
  OptionSheet,
  Screen,
} from '../components';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {selectUser, signOut} from '../store/slices/authSlice';
import {
  fetchBranches,
  fetchDepartments,
  setBranch,
  setDataset,
  setDept,
  selectBranches,
  selectDataset,
  selectDepartments,
  selectDept,
  selectSelectedBranch,
  selectCurrentBranch,
} from '../store/slices/dashboardSlice';
import {showToast} from '../store/slices/uiSlice';
import {ROUTES} from '../navigation/routes';
import {colors, gradients, alpha, ScaledSheet} from '../theme';

/**
 * The two TAT clocks. `processing` starts at sample receipt in the lab;
 * `registration` starts at collection, so it includes transit time.
 */
const DATASETS = [
  {
    key: 'processing',
    label: 'Processing TAT',
    caption: 'Clock starts at sample receipt',
  },
  {
    key: 'registration',
    label: 'Registration TAT',
    caption: 'Clock starts at collection',
  },
];

const MoreScreen = ({navigation}) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const branches = useAppSelector(selectBranches);
  const selectedBranch = useAppSelector(selectSelectedBranch);
  const currentBranch = useAppSelector(selectCurrentBranch);
  const departments = useAppSelector(selectDepartments);
  const dept = useAppSelector(selectDept);
  const dataset = useAppSelector(selectDataset);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const [datasetOpen, setDatasetOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    dispatch(fetchBranches());
  }, [dispatch]);

  // Which departments hold data depends on dataset + branch, so refetch when
  // either changes rather than only on mount.
  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch, dataset, selectedBranch]);

  const toast = message => dispatch(showToast(message));

  const branchCaption = currentBranch
    ? currentBranch.name
    : branches.seesAll
    ? `All ${branches.items.length} branches`
    : branches.items.length > 1
    ? `All ${branches.items.length} of my branches`
    : branches.items[0]?.name ?? 'No branch assigned';

  /**
   * Switching drops every cached summary; the dashboard screens refetch off
   * their scope key. Land the user on Home so they immediately see the branch
   * they picked rather than being left on this settings page.
   */
  const onPickBranch = code => {
    const picked = branches.items.find(b => b.code === code);

    dispatch(setBranch(code));
    setPickerOpen(false);
    toast(picked ? `Showing ${picked.name}` : 'Showing all your branches');
    navigation.navigate(ROUTES.HOME);
  };

  const selectedDept = departments.items.find(d => d.key === dept);

  const deptCaption = dept
    ? selectedDept?.label ?? dept
    : departments.items.length
    ? `All ${departments.items.length} departments`
    : 'All departments';

  const deptOptions = [
    {
      key: null,
      label: 'All departments',
      caption: 'Everything you have access to',
    },
    ...departments.items.map(d => ({
      key: d.key,
      label: d.label,
      count: d.count,
    })),
  ];

  const onPickDept = key => {
    dispatch(setDept(key));
    setDeptOpen(false);
    const picked = departments.items.find(d => d.key === key);
    toast(picked ? `Showing ${picked.label}` : 'Showing all departments');
    navigation.navigate(ROUTES.HOME);
  };

  const onPickDataset = key => {
    dispatch(setDataset(key));
    setDatasetOpen(false);
    toast(
      key === 'registration'
        ? 'Clock now runs from collection'
        : 'Clock now runs from sample receipt',
    );
    navigation.navigate(ROUTES.HOME);
  };

  const onConfirmSignOut = async () => {
    setSigningOut(true);
    await dispatch(signOut());
    // No need to close the dialog — signing out swaps the whole navigator.
  };

  return (
    <Screen statusBarColor={colors.white}>
      <AppBar eyebrow="Settings · account · help" title="MORE" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <LinearGradient
            colors={gradients.user}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.userCard}>
            <Avatar
              initials={user?.initials ?? '—'}
              variant="yellow"
              size={52}
              fontSize={15}
            />
            <View style={styles.userInfo}>
              <AppText
                variant="display"
                size={22}
                tracking={1.5}
                color={colors.white}
                numberOfLines={1}
                adjustsFontSizeToFit>
                {user?.name}
              </AppText>
              <AppText
                variant="mono"
                size={10}
                tracking={1}
                uppercase
                color={colors.yellow}
                style={styles.userRole}>
                {user?.role_label}
              </AppText>
              <AppText size={11.5} color={alpha.white70} style={styles.userBranch}>
                {user?.branch?.name ?? user?.email}
              </AppText>
            </View>
          </LinearGradient>

          <View style={styles.group}>
            <GroupTitle>OPERATIONS</GroupTitle>
            <MoreItem
              icon="business-outline"
              label="Switch Branch"
              caption={branchCaption}
              onPress={() =>
                branches.canSwitch
                  ? setPickerOpen(true)
                  : toast('You have access to one branch only')
              }
            />
            <MoreItem
              icon="git-branch-outline"
              label="Department"
              caption={deptCaption}
              onPress={() =>
                departments.items.length
                  ? setDeptOpen(true)
                  : toast('No departments with data in this view')
              }
            />
            <MoreItem
              icon="swap-horizontal-outline"
              label="TAT Clock"
              caption={
                DATASETS.find(d => d.key === dataset)?.label ?? 'Processing TAT'
              }
              onPress={() => setDatasetOpen(true)}
            />
            <MoreItem
              icon="library-outline"
              label="SLA Catalogue"
              caption="Std TAT vs achieved, per test"
              onPress={() => navigation.navigate(ROUTES.SLA)}
            />
            <MoreItem
              icon="bar-chart-outline"
              label="Shift Reports"
              caption="Daily · Weekly · Monthly rollups"
              onPress={() => navigation.navigate(ROUTES.REPORTS)}
            />
            <MoreItem
              icon="analytics-outline"
              label="Analytics"
              caption="TAT trend · phase split · department charts"
              onPress={() => navigation.navigate(ROUTES.ANALYTICS)}
            />
          </View>

          <View style={styles.group}>
            <GroupTitle>PREFERENCES</GroupTitle>
            <MoreItem
              icon="notifications-outline"
              label="Notifications"
              caption="Push alerts · quiet hours"
              onPress={() => navigation.navigate(ROUTES.NOTIFICATION_SETTINGS)}
            />
            <MoreItem
              icon="key-outline"
              label="Change Password"
              caption="Update your sign-in password"
              onPress={() => navigation.navigate(ROUTES.UPDATE_PASSWORD)}
            />
          </View>

          <View style={styles.group}>
            <GroupTitle>ACCOUNT</GroupTitle>
            <MoreItem
              icon="log-out-outline"
              label="Sign Out"
              caption="End this session"
              danger
              onPress={() => setSignOutOpen(true)}
            />
          </View>

          <AppText
            variant="mono"
            size={10}
            tracking={0.5}
            align="center"
            uppercase
            lineHeight={18}
            style={styles.footer}>
            Trust TAT Mobile · TL-OPS-TAT-003 v1.0{'\n'}
            TrustLab Diagnostics · Hyderabad
          </AppText>
        </View>
      </ScrollView>

      <BranchPicker
        visible={pickerOpen}
        branches={branches.items}
        selected={selectedBranch}
        onSelect={onPickBranch}
        onClose={() => setPickerOpen(false)}
      />

      <OptionSheet
        visible={deptOpen}
        title="Department"
        subtitle="Every screen narrows to the department you pick."
        options={deptOptions}
        selected={dept}
        onSelect={onPickDept}
        onClose={() => setDeptOpen(false)}
      />

      <OptionSheet
        visible={datasetOpen}
        title="TAT clock"
        subtitle="Which timestamp the turnaround is measured from."
        options={DATASETS}
        selected={dataset}
        onSelect={onPickDataset}
        onClose={() => setDatasetOpen(false)}
      />

      <ConfirmDialog
        visible={signOutOpen}
        tone="danger"
        icon="log-out-outline"
        title="Sign out?"
        message={
          'You will be signed out of Trust TAT on this device. ' +
          'Your queues stay available on the dashboard.'
        }
        confirmLabel="Sign out"
        cancelLabel="Stay"
        loading={signingOut}
        onConfirm={onConfirmSignOut}
        onCancel={() => setSignOutOpen(false)}
      />
    </Screen>
  );
};

const styles = ScaledSheet.create({
  body: {paddingHorizontal: '16@s', paddingTop: '14@vs'},
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '14@s',
    borderRadius: '16@ms',
    paddingHorizontal: '18@s',
    paddingVertical: '18@vs',
    marginBottom: '16@vs',
  },
  userInfo: {flex: 1, minWidth: 0},
  userRole: {marginTop: '4@vs'},
  userBranch: {marginTop: '3@vs'},
  group: {marginBottom: '20@vs'},
  footer: {
    paddingTop: '20@vs',
    paddingBottom: '30@vs',
    paddingHorizontal: '8@s',
  },
});

export default MoreScreen;
