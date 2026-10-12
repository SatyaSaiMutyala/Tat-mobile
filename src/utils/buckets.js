/**
 * Colour ramp for the time-to-deadline / days-late bucket strips.
 *
 * The API owns the bucket keys and labels; only the colour is a UI concern,
 * so it lives here. Unknown keys fall back to the neutral end of the ramp.
 */

export const DEADLINE_BUCKET_COLORS = {
  past: '#C8362A',
  '1h': '#D9600E',
  '2h': '#DE7A12',
  '3h': '#E08A1F',
  '4h': '#C8941E',
  '6h': '#A8901E',
  '8h': '#7FA34A',
  '10h': '#5BAA76',
  '12h': '#3E9C6B',
  '15h': '#2E8F5F',
  '18h': '#0F6E56',
};

export const DAYS_LATE_BUCKET_COLORS = {
  '1d': '#F0B429',
  '2d': '#E0A323',
  '3d': '#D08F1D',
  '4d': '#C97A1D',
  '5d': '#C26619',
  '6d': '#BB5215',
  '1w': '#B44011',
  '2w': '#9C3210',
  '3w': '#8B2A22',
  '1mo': '#6F211B',
};

const FALLBACK = '#0F6E56';

/** Buckets whose label reads better on a dark foreground. */
const LIGHT_BACKGROUNDS = new Set(['1d']);

/**
 * Maps an API bucket payload onto what <BucketGrid /> expects.
 *
 * @param {Array}  buckets  [{key, label, count, critical, specialised}]
 * @param {Object} palette  key -> hex
 */
export const toGridBuckets = (buckets, palette = DEADLINE_BUCKET_COLORS) =>
  (buckets || []).map(bucket => ({
    key: bucket.key,
    label: bucket.label,
    bg: palette[bucket.key] || FALLBACK,
    count: bucket.count,
    crit: bucket.critical,
    stat: bucket.specialised,
    dark: LIGHT_BACKGROUNDS.has(bucket.key),
  }));
