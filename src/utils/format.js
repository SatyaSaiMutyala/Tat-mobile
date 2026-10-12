/** Date / duration formatters used across the TAT screens. */

export const pad = n => String(n).padStart(2, '0');

const startOfDay = ms => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/** "14:30" today, "Yst 14:30", "3d ago 14:30" or "12/07 14:30". */
export const fmtDateTime = ms => {
  if (!ms) {
    return null;
  }
  const d = new Date(ms);
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const today = startOfDay(Date.now());
  const day = startOfDay(ms);

  if (today === day) {
    return time;
  }
  const days = Math.round((today - day) / 86400000);
  if (days === 1) {
    return `Yst ${time}`;
  }
  if (days > 1 && days < 7) {
    return `${days}d ago ${time}`;
  }
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${time}`;
};

/** "12/07" */
export const fmtDate = ms => {
  if (!ms) {
    return '—';
  }
  const d = new Date(ms);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
};

/** Absolute "1h 20m" style remaining/elapsed label. */
export const fmtTimeRemaining = minutes => {
  const abs = Math.abs(minutes);
  if (abs < 60) {
    return `${Math.round(abs)}m`;
  }
  const h = Math.floor(abs / 60);
  const m = Math.round(abs % 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

/** "+3d 4h" style age label for past-overdue samples. */
export const fmtAge = minutes => {
  if (minutes < 60) {
    return `+${Math.round(minutes)}m`;
  }
  if (minutes < 1440) {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return m === 0 ? `+${h}h` : `+${h}h ${m}m`;
  }
  const d = Math.floor(minutes / 1440);
  const h = Math.floor((minutes - d * 1440) / 60);
  return h === 0 ? `+${d}d` : `+${d}d ${h}h`;
};

/** Phase duration, e.g. "2h 42m". */
export const fmtDuration = minutes => {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

/** "just now", "12m ago", "3h ago", "2d ago" — or "in 45m" for the future. */
export const fmtRelative = ms => {
  if (!ms) {
    return '';
  }
  const diff = Date.now() - ms;
  const abs = Math.abs(diff);
  const future = diff < 0;

  const minutes = Math.round(abs / 60000);
  if (minutes < 1) {
    return 'just now';
  }
  if (minutes < 60) {
    return future ? `in ${minutes}m` : `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return future ? `in ${hours}h` : `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return future ? `in ${days}d` : `${days}d ago`;
};

export const clockNow = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  return hour < 17 ? 'Good afternoon' : 'Good evening';
};

export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
