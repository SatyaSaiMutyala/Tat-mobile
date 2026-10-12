/**
 * Responsive sizing — every screen and component sizes through these
 * helpers (or `ScaledSheet`), never raw pixels.
 *
 *   s / scale          -> widths, horizontal padding & margin
 *   vs / verticalScale -> heights, vertical padding & margin
 *   ms / moderateScale -> font sizes, radii, icon sizes
 */
import {Dimensions} from 'react-native';
import {
  scale,
  verticalScale,
  moderateScale,
  moderateVerticalScale,
  ScaledSheet,
} from 'react-native-size-matters';

const {width, height} = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export const s = size => scale(size);
export const vs = size => verticalScale(size);
export const ms = (size, factor = 0.5) => moderateScale(size, factor);
export const mvs = (size, factor = 0.5) => moderateVerticalScale(size, factor);

export {
  scale,
  verticalScale,
  moderateScale,
  moderateVerticalScale,
  ScaledSheet,
};

export default {s, vs, ms, mvs, SCREEN_WIDTH, SCREEN_HEIGHT};
