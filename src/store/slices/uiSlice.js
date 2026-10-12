import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  /** Today's TAT filters */
  todayChip: 'all', // all | past | crit | stat
  todayBucket: null,

  /** Past Overdue filters */
  overdueChip: 'all', // all | aged | crit | stat
  overdueBucket: null,

  toast: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTodayChip: (state, action) => {
      state.todayChip = action.payload;
      state.todayBucket = null;
    },
    toggleTodayBucket: (state, action) => {
      state.todayBucket =
        state.todayBucket === action.payload ? null : action.payload;
    },
    setOverdueChip: (state, action) => {
      state.overdueChip = action.payload;
      state.overdueBucket = null;
    },
    toggleOverdueBucket: (state, action) => {
      state.overdueBucket =
        state.overdueBucket === action.payload ? null : action.payload;
    },
    resetFilters: state => {
      state.todayChip = 'all';
      state.todayBucket = null;
      state.overdueChip = 'all';
      state.overdueBucket = null;
    },
    showToast: (state, action) => {
      state.toast = action.payload;
    },
    hideToast: state => {
      state.toast = null;
    },
  },
});

export const {
  setTodayChip,
  toggleTodayBucket,
  setOverdueChip,
  toggleOverdueBucket,
  resetFilters,
  showToast,
  hideToast,
} = uiSlice.actions;

export const selectUi = state => state.ui;
export const selectToast = state => state.ui.toast;

export default uiSlice.reducer;
