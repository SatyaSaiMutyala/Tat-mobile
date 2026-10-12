import {createSlice, createSelector} from '@reduxjs/toolkit';

import generateSamples from '../../data/generateSamples';
import {
  isDueToday,
  isPastOverdue,
  timeRemainingMin,
  daysLate,
  overdueByMin,
  currentPhaseOf,
} from '../../utils/tat';

const samplesSlice = createSlice({
  name: 'samples',
  initialState: {
    items: generateSamples(),
  },
  reducers: {
    // Placeholder for the API-backed refresh.
    setSamples: (state, action) => {
      state.items = action.payload;
    },
  },
});

export const {setSamples} = samplesSlice.actions;

/* ---------- selectors ---------- */

export const selectSamples = state => state.samples.items;

export const selectSampleById = (state, id) =>
  state.samples.items.find(s => s.id === id);

/** Everything with a release date of today, decorated for the list UI. */
export const selectToday = createSelector(selectSamples, items =>
  items.filter(isDueToday),
);

export const selectTodayPending = createSelector(selectToday, items =>
  items
    .filter(s => !s.reported)
    .map(s => ({
      ...s,
      remain: timeRemainingMin(s),
      phase: currentPhaseOf(s),
    }))
    .sort((a, b) => a.remain - b.remain),
);

export const selectTodayReleased = createSelector(selectToday, items =>
  items.filter(s => s.reported),
);

/** Missed release date and still not reported. */
export const selectPastOverdue = createSelector(selectSamples, items =>
  items
    .filter(isPastOverdue)
    .map(s => ({
      ...s,
      lateDays: daysLate(s),
      ovdMin: overdueByMin(s),
      phase: currentPhaseOf(s),
    }))
    .sort((a, b) => b.lateDays - a.lateDays),
);

export const selectDueInOneHour = createSelector(selectTodayPending, items =>
  items.filter(s => s.remain >= 0 && s.remain < 60),
);

/** Three most time-critical samples for the Home preview. */
export const selectMostUrgent = createSelector(
  [selectTodayPending, selectPastOverdue],
  (pending, overdue) =>
    [...pending, ...overdue]
      .map(s => ({...s, remain: timeRemainingMin(s)}))
      .sort((a, b) => a.remain - b.remain)
      .slice(0, 3),
);

export const selectCriticalCount = createSelector(
  [selectTodayPending, selectPastOverdue],
  (pending, overdue) =>
    [...pending, ...overdue].filter(s => s.priority === 'Critical').length,
);

export default samplesSlice.reducer;
