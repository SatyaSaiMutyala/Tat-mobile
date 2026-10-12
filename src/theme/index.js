import colors, {gradients, alpha} from './colors';
import fonts, {weight} from './fonts';
import metrics, {
  s,
  vs,
  ms,
  mvs,
  scale,
  verticalScale,
  moderateScale,
  moderateVerticalScale,
  ScaledSheet,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from './metrics';

export const shadow = {
  tabbar: {
    shadowColor: colors.greenDeep,
    shadowOffset: {width: 0, height: -6},
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 12,
  },
  heroCrit: {
    shadowColor: colors.crit,
    shadowOffset: {width: 0, height: 14},
    shadowOpacity: 0.32,
    shadowRadius: 36,
    elevation: 10,
  },
  heroWarn: {
    shadowColor: colors.warn,
    shadowOffset: {width: 0, height: 14},
    shadowOpacity: 0.32,
    shadowRadius: 36,
    elevation: 10,
  },
  heroOk: {
    shadowColor: colors.tealDeep,
    shadowOffset: {width: 0, height: 14},
    shadowOpacity: 0.32,
    shadowRadius: 36,
    elevation: 10,
  },
  teal: {
    shadowColor: colors.teal,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.3,
    shadowRadius: 28,
    elevation: 8,
  },
  yellow: {
    shadowColor: colors.yellow,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 6,
  },
  toast: {
    shadowColor: colors.greenDeep,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 14,
  },
  /** Soft lift for a light button sitting on the dark auth background. */
  authButton: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
  dialog: {
    shadowColor: colors.greenDeep,
    shadowOffset: {width: 0, height: 16},
    shadowOpacity: 0.28,
    shadowRadius: 34,
    elevation: 20,
  },
};

export {
  colors,
  gradients,
  alpha,
  fonts,
  weight,
  metrics,
  s,
  vs,
  ms,
  mvs,
  scale,
  verticalScale,
  moderateScale,
  moderateVerticalScale,
  ScaledSheet,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
};

export default {colors, gradients, alpha, fonts, metrics, shadow};
