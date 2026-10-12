import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import MainTabs from './MainTabs';
import SignInScreen from '../screens/SignInScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import DetailScreen from '../screens/DetailScreen';
import SlaScreen from '../screens/SlaScreen';
import UpdatePasswordScreen from '../screens/UpdatePasswordScreen';
import ReportsScreen from '../screens/ReportsScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import SplashScreen from '../screens/SplashScreen';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
  restoreSession,
  selectIsAuthenticated,
  selectBootstrapping,
  selectMustChangePassword,
} from '../store/slices/authSlice';
import {colors} from '../theme';
import {ROUTES} from './routes';

const Stack = createNativeStackNavigator();

const navTheme = {
  dark: false,
  colors: {
    primary: colors.teal,
    background: colors.paper,
    card: colors.white,
    text: colors.ink,
    border: colors.line,
    notification: colors.crit,
  },
};

/**
 * Three mutually exclusive states:
 *   not signed in            -> SignIn
 *   signed in, temp password -> ChangePassword (nothing else reachable)
 *   signed in                -> the tabbed app
 */
const RootNavigator = () => {
  const dispatch = useAppDispatch();

  const bootstrapping = useAppSelector(selectBootstrapping);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const mustChangePassword = useAppSelector(selectMustChangePassword);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  if (bootstrapping) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!isAuthenticated ? (
          <Stack.Screen name={ROUTES.SIGN_IN} component={SignInScreen} />
        ) : mustChangePassword ? (
          <Stack.Screen
            name={ROUTES.CHANGE_PASSWORD}
            component={ChangePasswordScreen}
          />
        ) : (
          <>
            <Stack.Screen name={ROUTES.MAIN_TABS} component={MainTabs} />
            <Stack.Screen name={ROUTES.DETAIL} component={DetailScreen} />
            <Stack.Screen name={ROUTES.SLA} component={SlaScreen} />
            <Stack.Screen
              name={ROUTES.UPDATE_PASSWORD}
              component={UpdatePasswordScreen}
            />
            <Stack.Screen name={ROUTES.REPORTS} component={ReportsScreen} />
            <Stack.Screen name={ROUTES.ANALYTICS} component={AnalyticsScreen} />
            <Stack.Screen
              name={ROUTES.NOTIFICATION_SETTINGS}
              component={NotificationSettingsScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
