import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {TabBar} from '../components';
import HomeScreen from '../screens/HomeScreen';
import TodayScreen from '../screens/TodayScreen';
import OverdueScreen from '../screens/OverdueScreen';
import AlertsScreen from '../screens/AlertsScreen';
import MoreScreen from '../screens/MoreScreen';
import {useAppSelector} from '../store/hooks';
import {selectHome} from '../store/slices/dashboardSlice';
import {selectUnreadCount} from '../store/slices/notificationsSlice';
import {ROUTES} from './routes';

const Tab = createBottomTabNavigator();

const renderTabBar = props => <TabBar {...props} />;

const MainTabs = () => {
  // Badge counts come from the Home summary, so they can never disagree with
  // the numbers on the dashboard itself.
  const home = useAppSelector(selectHome);

  const todayCount = home.today?.expected ?? 0;
  const overdueCount = home.overdue?.total ?? 0;

  // Real unread notifications, not a derived figure.
  const alertCount = useAppSelector(selectUnreadCount);

  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{headerShown: false}}
      initialRouteName={ROUTES.HOME}>
      <Tab.Screen
        name={ROUTES.HOME}
        component={HomeScreen}
        options={{title: 'Home', tabBarIconName: 'home'}}
      />
      <Tab.Screen
        name={ROUTES.TODAY}
        component={TodayScreen}
        options={{
          title: 'Today',
          tabBarIconName: 'clock',
          tabBarBadge: todayCount,
          tabBarBadgeStyle: {tone: 'teal'},
        }}
      />
      <Tab.Screen
        name={ROUTES.OVERDUE}
        component={OverdueScreen}
        options={{
          title: 'Overdue',
          tabBarIconName: 'alert-triangle',
          tabBarBadge: overdueCount,
        }}
      />
      <Tab.Screen
        name={ROUTES.ALERTS}
        component={AlertsScreen}
        options={{
          title: 'Alerts',
          tabBarIconName: 'bell',
          tabBarBadge: alertCount,
        }}
      />
      <Tab.Screen
        name={ROUTES.MORE}
        component={MoreScreen}
        options={{title: 'More', tabBarIconName: 'more-horizontal'}}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
