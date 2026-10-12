import {createSlice, createAsyncThunk, createSelector} from '@reduxjs/toolkit';

import {
  fetchBranchesRequest,
  fetchDepartmentsRequest,
  fetchHomeRequest,
  fetchOverdueRequest,
  fetchReportsRequest,
  fetchAnalyticsRequest,
  fetchSampleRequest,
  fetchSamplesRequest,
  fetchSlaRequest,
  fetchTodayRequest,
} from '../../services/dashboardApi';
import {parseApiError} from '../../services/api';

/** Skip a refetch if the cached payload is younger than this (ms). */
export const STALE_AFTER = 60_000;

const emptyList = () => ({
  items: [],
  page: 0,
  hasMore: true,
  status: 'idle',
  error: null,
  refreshing: false,
  /** Committed free-text search term for this list. */
  query: '',
});

/**
 * Drops every cached summary and list. Called whenever the data scope changes
 * (dataset, branch, department) — each of those changes every figure on screen,
 * so keeping the old numbers around would show stale data mid-refetch.
 */
const invalidateScope = state => {
  state.home = {...initialState.home};
  state.today = {...initialState.today};
  state.overdue = {...initialState.overdue};
  state.lists = {
    today: emptyList(),
    overdue: emptyList(),
    pending: emptyList(),
  };
};

const initialState = {
  /** 'processing' (clock from SRA) | 'registration' (clock from collection) */
  dataset: 'processing',

  /**
   * Selected branch code, or null for "all branches I can see".
   * The server always clamps this to the user's own access.
   */
  branch: null,

  /** Selected department name, or null for every department in scope. */
  dept: null,

  /** Departments that actually hold data in the current scope. */
  departments: {
    items: [],
    status: 'idle',
    error: null,
  },

  branches: {
    items: [],
    seesAll: false,
    canSwitch: false,
    status: 'idle',
  },

  home: {
    today: null,
    overdue: null,
    urgent: [],
    generatedAt: null,
    status: 'idle',
    error: null,
    refreshing: false,
    fetchedAt: null,
  },

  /** Today's TAT summary: KPI row, bucket strip, chip counts. */
  today: {
    kpis: null,
    buckets: [],
    chips: null,
    refDay: null,
    status: 'idle',
    error: null,
    fetchedAt: null,
  },

  /** Past Overdue summary: KPI totals, days-late strip, carry-over banner. */
  overdue: {
    kpis: null,
    buckets: [],
    chips: null,
    carryOver: null,
    oldest: null,
    status: 'idle',
    error: null,
    fetchedAt: null,
  },

  /** Paginated lists, one entry per scope. */
  lists: {
    today: emptyList(),
    overdue: emptyList(),
    pending: emptyList(),
  },

  /** Per-test SLA matrix. Range-based, so it carries its own window. */
  sla: {
    rows: [],
    summary: null,
    range: '30',
    query: '',
    page: 0,
    hasMore: true,
    status: 'idle',
    error: null,
    refreshing: false,
  },

  /** Shift rollup. Period-based, so it carries its own window. */
  reports: {
    period: 'weekly',
    from: null,
    to: null,
    kpis: null,
    trend: [],
    shifts: [],
    shiftBasis: 'reg_at',
    departments: [],
    status: 'idle',
    error: null,
    refreshing: false,
  },

  /** Chart data for the Analytics screen. Period-based like `reports`. */
  analytics: {
    period: 'weekly',
    from: null,
    to: null,
    kpis: null,
    trend: [],
    phases: [],
    departments: [],
    status: 'idle',
    error: null,
    refreshing: false,
  },

  /** The sample currently open on the detail screen. */
  detail: {
    id: null,
    sample: null,
    status: 'idle',
    error: null,
  },
};

export const fetchHome = createAsyncThunk(
  'dashboard/fetchHome',
  async ({refresh = false} = {}, {getState, rejectWithValue}) => {
    try {
      const data = await fetchHomeRequest({dataset: getState().dashboard.dataset, branch: getState().dashboard.branch, dept: getState().dashboard.dept});
      return {data, refresh};
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  },
  {
    /** Don't queue a second request while one is already in flight. */
    condition: ({refresh = false} = {}, {getState}) => {
      const {status, fetchedAt} = getState().dashboard.home;
      if (status === 'loading') {
        return false;
      }
      if (refresh) {
        return true;
      }
      return !fetchedAt || Date.now() - fetchedAt > STALE_AFTER;
    },
  },
);

/**
 * Loads one page of a list. `refresh: true` restarts at page 1 and replaces
 * the items; otherwise the next page is appended.
 */
export const fetchSamples = createAsyncThunk(
  'dashboard/fetchSamples',
  async ({scope = 'today', refresh = false, bucket, category} = {}, {getState, rejectWithValue}) => {
    const state = getState().dashboard;
    const list = state.lists[scope] ?? emptyList();
    const page = refresh ? 1 : list.page + 1;
    // Captured here and echoed back so the reducer can drop a response that
    // belongs to a search term the user has already moved on from.
    const q = list.query;

    try {
      const data = await fetchSamplesRequest({
        scope,
        page,
        dataset: state.dataset,
        branch: state.branch,
        dept: state.dept,
        bucket,
        category,
        q,
      });
      return {scope, refresh, page, data, q};
    } catch (error) {
      return rejectWithValue({scope, q, ...parseApiError(error)});
    }
  },
  {
    condition: ({scope = 'today', refresh = false} = {}, {getState}) => {
      const list = getState().dashboard.lists[scope];
      if (!list) {
        return true;
      }
      // A refresh must get through even mid-flight: typing in the search box
      // fires one while the previous term's request is still open, and dropping
      // it would leave the list showing results for the abandoned term.
      if (list.status === 'loading' && !refresh) {
        return false;
      }
      // Nothing left to fetch unless this is an explicit refresh.
      return refresh || list.hasMore;
    },
  },
);

export const fetchTodaySummary = createAsyncThunk(
  'dashboard/fetchTodaySummary',
  async ({refresh = false} = {}, {getState, rejectWithValue}) => {
    try {
      return await fetchTodayRequest({dataset: getState().dashboard.dataset, branch: getState().dashboard.branch, dept: getState().dashboard.dept});
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  },
  {
    condition: ({refresh = false} = {}, {getState}) => {
      const {status, fetchedAt} = getState().dashboard.today;
      if (status === 'loading') {
        return false;
      }
      return refresh || !fetchedAt || Date.now() - fetchedAt > STALE_AFTER;
    },
  },
);

export const fetchOverdueSummary = createAsyncThunk(
  'dashboard/fetchOverdueSummary',
  async ({refresh = false} = {}, {getState, rejectWithValue}) => {
    try {
      return await fetchOverdueRequest({dataset: getState().dashboard.dataset, branch: getState().dashboard.branch, dept: getState().dashboard.dept});
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  },
  {
    condition: ({refresh = false} = {}, {getState}) => {
      const {status, fetchedAt} = getState().dashboard.overdue;
      if (status === 'loading') {
        return false;
      }
      return refresh || !fetchedAt || Date.now() - fetchedAt > STALE_AFTER;
    },
  },
);

export const fetchSla = createAsyncThunk(
  'dashboard/fetchSla',
  async ({refresh = false} = {}, {getState, rejectWithValue}) => {
    const state = getState().dashboard;
    const page = refresh ? 1 : state.sla.page + 1;

    try {
      const data = await fetchSlaRequest({
        dataset: state.dataset,
        branch: state.branch,
        dept: state.dept,
        range: state.sla.range,
        q: state.sla.query,
        page,
      });
      return {data, refresh, page};
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  },
  {
    condition: ({refresh = false} = {}, {getState}) => {
      const {status, hasMore} = getState().dashboard.sla;
      if (status === 'loading') {
        return false;
      }
      return refresh || hasMore;
    },
  },
);

export const fetchReports = createAsyncThunk(
  'dashboard/fetchReports',
  async ({refresh = false} = {}, {getState, rejectWithValue}) => {
    const state = getState().dashboard;
    try {
      const data = await fetchReportsRequest({
        period: state.reports.period,
        dataset: state.dataset,
        branch: state.branch,
        dept: state.dept,
      });
      return {data, refresh};
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  },
  {
    condition: (_, {getState}) =>
      getState().dashboard.reports.status !== 'loading',
  },
);

export const fetchAnalytics = createAsyncThunk(
  'dashboard/fetchAnalytics',
  async ({refresh = false} = {}, {getState, rejectWithValue}) => {
    const state = getState().dashboard;
    try {
      const data = await fetchAnalyticsRequest({
        period: state.analytics.period,
        dataset: state.dataset,
        branch: state.branch,
        dept: state.dept,
      });
      return {data, refresh};
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  },
  {
    condition: (_, {getState}) =>
      getState().dashboard.analytics.status !== 'loading',
  },
);

/**
 * The departments that hold data in the current dataset + branch. Deliberately
 * NOT filtered by `dept` itself — the picker must keep listing the others.
 */
export const fetchDepartments = createAsyncThunk(
  'dashboard/fetchDepartments',
  async (_, {getState, rejectWithValue}) => {
    const state = getState().dashboard;
    try {
      return await fetchDepartmentsRequest({
        dataset: state.dataset,
        branch: state.branch,
      });
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  },
  {
    condition: (_, {getState}) =>
      getState().dashboard.departments.status !== 'loading',
  },
);

export const fetchBranches = createAsyncThunk(
  'dashboard/fetchBranches',
  async (_, {rejectWithValue}) => {
    try {
      return await fetchBranchesRequest();
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  },
  {
    condition: (_, {getState}) => getState().dashboard.branches.status !== 'loading',
  },
);

export const fetchSampleDetail = createAsyncThunk(
  'dashboard/fetchSampleDetail',
  async (id, {getState, rejectWithValue}) => {
    try {
      const sample = await fetchSampleRequest(id, {
        dataset: getState().dashboard.dataset,
      });
      return {id, sample};
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  },
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    /** Switching dataset invalidates everything — the numbers all change. */
    setDataset: (state, action) => {
      if (state.dataset === action.payload) {
        return;
      }
      state.dataset = action.payload;
      invalidateScope(state);
      // Which departments hold data depends on the dataset.
      state.departments = {...initialState.departments};
    },
    /**
     * Switch the branch in view. Like dataset, every figure changes, so all
     * cached summaries and lists are dropped. `null` = all accessible branches.
     */
    setBranch: (state, action) => {
      if (state.branch === action.payload) {
        return;
      }
      state.branch = action.payload;
      invalidateScope(state);
      // A different branch runs different departments.
      state.departments = {...initialState.departments};
      // The old branch's department may not exist in the new one.
      state.dept = null;
    },
    /** Narrow to one department, or `null` for every one in scope. */
    setDept: (state, action) => {
      if (state.dept === action.payload) {
        return;
      }
      state.dept = action.payload;
      invalidateScope(state);
    },
    resetList: (state, action) => {
      state.lists[action.payload] = emptyList();
    },
    /**
     * Commits a search term for one list and clears what is on screen, so the
     * next fetch starts from page 1 rather than appending to the old results.
     */
    setListQuery: (state, action) => {
      const {scope, query} = action.payload;
      const list = state.lists[scope] ?? (state.lists[scope] = emptyList());
      if (list.query === query) {
        return;
      }
      list.query = query;
      list.items = [];
      list.page = 0;
      list.hasMore = true;
      list.error = null;
    },
    clearDetail: state => {
      state.detail = {id: null, sample: null, status: 'idle', error: null};
    },
    /** Switching period reloads the rollup from scratch. */
    setAnalyticsPeriod: (state, action) => {
      if (state.analytics.period === action.payload) {
        return;
      }
      state.analytics = {...initialState.analytics, period: action.payload};
    },
    setReportPeriod: (state, action) => {
      if (state.reports.period === action.payload) {
        return;
      }
      state.reports = {...initialState.reports, period: action.payload};
    },
    /** Changing the window or search restarts the SLA list. */
    setSlaRange: (state, action) => {
      state.sla.range = action.payload;
      state.sla.page = 0;
      state.sla.hasMore = true;
      state.sla.rows = [];
    },
    setSlaQuery: (state, action) => {
      state.sla.query = action.payload;
      state.sla.page = 0;
      state.sla.hasMore = true;
      state.sla.rows = [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchHome.pending, (state, action) => {
        state.home.status = 'loading';
        state.home.refreshing = Boolean(action.meta.arg?.refresh);
        state.home.error = null;
      })
      .addCase(fetchHome.fulfilled, (state, action) => {
        const {data} = action.payload;
        state.home.status = 'succeeded';
        state.home.refreshing = false;
        state.home.today = data.today;
        state.home.overdue = data.overdue;
        state.home.urgent = data.urgent ?? [];
        state.home.generatedAt = data.generated_at;
        state.home.fetchedAt = Date.now();
      })
      .addCase(fetchHome.rejected, (state, action) => {
        state.home.status = 'failed';
        state.home.refreshing = false;
        state.home.error = action.payload?.message || 'Unable to load the dashboard.';
      })

      .addCase(fetchTodaySummary.pending, state => {
        state.today.status = 'loading';
        state.today.error = null;
      })
      .addCase(fetchTodaySummary.fulfilled, (state, action) => {
        state.today.status = 'succeeded';
        state.today.kpis = action.payload.kpis;
        state.today.buckets = action.payload.buckets ?? [];
        state.today.chips = action.payload.chips;
        state.today.refDay = action.payload.ref_day;
        state.today.fetchedAt = Date.now();
      })
      .addCase(fetchTodaySummary.rejected, (state, action) => {
        state.today.status = 'failed';
        state.today.error = action.payload?.message || 'Unable to load today’s queue.';
      })

      .addCase(fetchOverdueSummary.pending, state => {
        state.overdue.status = 'loading';
        state.overdue.error = null;
      })
      .addCase(fetchOverdueSummary.fulfilled, (state, action) => {
        state.overdue.status = 'succeeded';
        state.overdue.kpis = action.payload.kpis;
        state.overdue.buckets = action.payload.buckets ?? [];
        state.overdue.chips = action.payload.chips;
        state.overdue.carryOver = action.payload.carry_over;
        state.overdue.oldest = action.payload.oldest;
        state.overdue.fetchedAt = Date.now();
      })
      .addCase(fetchOverdueSummary.rejected, (state, action) => {
        state.overdue.status = 'failed';
        state.overdue.error = action.payload?.message || 'Unable to load the overdue queue.';
      })

      .addCase(fetchSla.pending, (state, action) => {
        state.sla.status = 'loading';
        state.sla.refreshing = Boolean(action.meta.arg?.refresh);
        state.sla.error = null;
      })
      .addCase(fetchSla.fulfilled, (state, action) => {
        const {data, refresh, page} = action.payload;
        state.sla.status = 'succeeded';
        state.sla.refreshing = false;
        state.sla.page = page;
        state.sla.hasMore = Boolean(data.meta?.has_more);
        state.sla.summary = data.summary;
        state.sla.rows = refresh ? data.data : [...state.sla.rows, ...data.data];
      })
      .addCase(fetchSla.rejected, (state, action) => {
        state.sla.status = 'failed';
        state.sla.refreshing = false;
        state.sla.error = action.payload?.message || 'Unable to load the SLA catalogue.';
      })

      .addCase(fetchBranches.pending, state => {
        state.branches.status = 'loading';
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.branches.status = 'succeeded';
        state.branches.items = action.payload.branches ?? [];
        state.branches.seesAll = Boolean(action.payload.sees_all);
        state.branches.canSwitch = Boolean(action.payload.can_switch);
      })
      .addCase(fetchBranches.rejected, state => {
        state.branches.status = 'failed';
      })

      .addCase(fetchAnalytics.pending, (state, action) => {
        state.analytics.status = 'loading';
        state.analytics.refreshing = Boolean(action.meta.arg?.refresh);
        state.analytics.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        const {data} = action.payload;
        state.analytics.status = 'succeeded';
        state.analytics.refreshing = false;
        state.analytics.from = data.from;
        state.analytics.to = data.to;
        state.analytics.kpis = data.kpis;
        state.analytics.trend = data.trend ?? [];
        state.analytics.phases = data.phases ?? [];
        state.analytics.departments = data.departments ?? [];
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.analytics.status = 'failed';
        state.analytics.refreshing = false;
        state.analytics.error =
          action.payload?.message || 'Unable to load analytics.';
      })
      .addCase(fetchReports.pending, (state, action) => {
        state.reports.status = 'loading';
        state.reports.refreshing = Boolean(action.meta.arg?.refresh);
        state.reports.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        const {data} = action.payload;
        state.reports.status = 'succeeded';
        state.reports.refreshing = false;
        state.reports.from = data.from;
        state.reports.to = data.to;
        state.reports.kpis = data.kpis;
        state.reports.trend = data.trend ?? [];
        state.reports.shifts = data.shifts ?? [];
        state.reports.shiftBasis = data.shift_basis ?? 'reg_at';
        state.reports.departments = data.departments ?? [];
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.reports.status = 'failed';
        state.reports.refreshing = false;
        state.reports.error =
          action.payload?.message || 'Unable to load reports.';
      })

      .addCase(fetchDepartments.pending, state => {
        state.departments.status = 'loading';
        state.departments.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.departments.status = 'succeeded';
        state.departments.items = action.payload.departments ?? [];

        // The selected department may not exist in this dataset/branch — drop
        // it rather than leave every screen filtered to something invisible.
        if (
          state.dept &&
          !state.departments.items.some(d => d.key === state.dept)
        ) {
          state.dept = null;
        }
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.departments.status = 'failed';
        state.departments.error =
          action.payload?.message || 'Unable to load departments.';
      })

      .addCase(fetchSamples.pending, (state, action) => {
        const {scope = 'today', refresh} = action.meta.arg || {};
        const list = state.lists[scope] ?? (state.lists[scope] = emptyList());
        list.status = 'loading';
        list.refreshing = Boolean(refresh);
        list.error = null;
      })
      .addCase(fetchSamples.fulfilled, (state, action) => {
        const {scope, refresh, page, data, q} = action.payload;
        const list = state.lists[scope];
        // Late response for a search term that has since changed — ignore it,
        // otherwise results for an abandoned term overwrite the current ones.
        if (list.query !== q) {
          return;
        }
        list.status = 'succeeded';
        list.refreshing = false;
        list.page = page;
        list.hasMore = Boolean(data.meta?.has_more);
        list.items = refresh ? data.data : [...list.items, ...data.data];
      })
      .addCase(fetchSamples.rejected, (state, action) => {
        const scope = action.payload?.scope || action.meta.arg?.scope || 'today';
        const list = state.lists[scope];
        if (list && list.query === (action.payload?.q ?? list.query)) {
          list.status = 'failed';
          list.refreshing = false;
          list.error = action.payload?.message || 'Unable to load samples.';
        }
      })

      .addCase(fetchSampleDetail.pending, (state, action) => {
        // Drop the previous sample so the screen never shows stale data
        // belonging to a different barcode while the new one loads.
        if (state.detail.id !== action.meta.arg) {
          state.detail.sample = null;
        }
        state.detail.id = action.meta.arg;
        state.detail.status = 'loading';
        state.detail.error = null;
      })
      .addCase(fetchSampleDetail.fulfilled, (state, action) => {
        state.detail.status = 'succeeded';
        state.detail.id = action.payload.id;
        state.detail.sample = action.payload.sample;
      })
      .addCase(fetchSampleDetail.rejected, (state, action) => {
        state.detail.status = 'failed';
        state.detail.error = action.payload?.message || 'Unable to load this sample.';
      });
  },
});

export const {
  setDataset,
  setBranch,
  setDept,
  resetList,
  setListQuery,
  setReportPeriod,
  setAnalyticsPeriod,
  clearDetail,
  setSlaRange,
  setSlaQuery,
} = dashboardSlice.actions;

export const selectSla = state => state.dashboard.sla;

export const selectBranches = state => state.dashboard.branches;
export const selectSelectedBranch = state => state.dashboard.branch;

/**
 * Identifies the data scope currently in view.
 *
 * Screens use this as a fetch-effect dependency: tab screens stay mounted, so
 * without it a branch or dataset change would clear the cache and leave the
 * screen showing zeros with no request in flight.
 */
export const selectScopeKey = state =>
  `${state.dashboard.dataset}:${state.dashboard.branch ?? 'all'}:${
    state.dashboard.dept ?? 'all'
  }`;

/** Departments available in the current scope, plus the one selected. */
export const selectDepartments = state => state.dashboard.departments;
export const selectDept = state => state.dashboard.dept;
export const selectReports = state => state.dashboard.reports;
export const selectAnalytics = state => state.dashboard.analytics;

/** The branch currently in view, or null when showing all accessible ones. */
export const selectCurrentBranch = createSelector(
  [selectBranches, selectSelectedBranch],
  (branches, code) =>
    code ? branches.items.find(b => b.code === code) ?? null : null,
);

export const selectDetail = state => state.dashboard.detail;

/* ---------- selectors ---------- */

export const selectDataset = state => state.dashboard.dataset;
export const selectToday = state => state.dashboard.today;
export const selectOverdue = state => state.dashboard.overdue;
export const selectHome = state => state.dashboard.home;
export const selectHomeToday = state => state.dashboard.home.today;
export const selectHomeOverdue = state => state.dashboard.home.overdue;
export const selectHomeUrgent = state => state.dashboard.home.urgent;

export const selectList = scope => state =>
  state.dashboard.lists[scope] ?? emptyList();

/** True only for the very first load, so refreshes don't blank the screen. */
export const selectHomeInitialLoading = createSelector(selectHome, home =>
  home.status === 'loading' && home.fetchedAt === null,
);

/**
 * Which hero variant Home should show, derived once here rather than in the
 * component so it isn't recomputed on unrelated re-renders.
 */
export const selectHeroState = createSelector(selectHome, home => {
  const overdueTotal = home.overdue?.total ?? 0;
  const dueSoon = home.today?.due_within_1h ?? 0;
  const released = home.today?.released ?? 0;

  if (overdueTotal > 0) {
    return {
      tone: 'crit',
      eyebrow: 'LIVE OVERDUE QUEUE',
      value: overdueTotal,
      oldestDays: home.overdue?.oldest_days ?? null,
    };
  }
  if (dueSoon > 0) {
    return {tone: 'warn', eyebrow: 'PENDING TIGHT WINDOW', value: dueSoon, oldestDays: null};
  }
  return {tone: 'ok', eyebrow: 'ALL CAUGHT UP', value: released, oldestDays: null};
});

export default dashboardSlice.reducer;
