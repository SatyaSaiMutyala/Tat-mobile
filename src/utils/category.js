/**
 * Sample category helpers.
 *
 * The backend's categories are routine / specialised / critical / sendout —
 * there is no "STAT". These map them onto the tag styles the UI already has.
 */

const LABELS = {
  critical: 'CRIT',
  specialised: 'SPEC',
  routine: 'ROUT',
  sendout: 'SEND',
};

const TONES = {
  critical: 'crit',
  specialised: 'stat',
  routine: 'rout',
  sendout: 'branch',
};

export const categoryLabel = category => LABELS[category] || 'ROUT';

export const categoryTone = category => TONES[category] || 'rout';

/** Full word for the meta line, e.g. "CRITICAL · SLA 4H". */
export const categoryWord = category => (category || 'routine').toUpperCase();
