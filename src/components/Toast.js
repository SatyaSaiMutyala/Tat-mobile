import React, {useEffect, useRef} from 'react';
import {Animated, Easing} from 'react-native';

import AppText from './AppText';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {hideToast, selectToast} from '../store/slices/uiSlice';
import {colors, shadow, ScaledSheet} from '../theme';

const DURATION = 2800;

/** App-wide toast, driven by the `ui` slice. */
const Toast = () => {
  const dispatch = useAppDispatch();
  const message = useAppSelector(selectToast);

  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);

  useEffect(() => {
    if (!message) {
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
      return undefined;
    }

    Animated.timing(anim, {
      toValue: 1,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    timer.current = setTimeout(() => dispatch(hideToast()), DURATION);
    return () => clearTimeout(timer.current);
  }, [message, anim, dispatch]);

  if (!message) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        shadow.toast,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}>
      <AppText
        size={12.5}
        weight="bold"
        align="center"
        tracking={0.3}
        lineHeight={18}
        color={colors.white}>
        {message}
      </AppText>
    </Animated.View>
  );
};

const styles = ScaledSheet.create({
  toast: {
    position: 'absolute',
    bottom: '90@vs',
    alignSelf: 'center',
    maxWidth: '340@s',
    backgroundColor: colors.greenDeep,
    paddingHorizontal: '20@s',
    paddingVertical: '12@vs',
    borderRadius: '30@ms',
    zIndex: 1000,
  },
});

export default Toast;
