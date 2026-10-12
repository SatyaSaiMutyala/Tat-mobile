import api from './api';

/** GET /dashboard/home — KPI blocks plus the three most urgent samples. */
export const fetchHomeRequest = async ({dataset = 'processing', branch, dept} = {}) => {
  const {data} = await api.get('/dashboard/home', {
    params: {dataset, branch, dept},
  });
  return data;
};

/** GET /dashboard/today — KPIs, deadline buckets and chip counts. */
export const fetchTodayRequest = async ({dataset = 'processing', branch, dept} = {}) => {
  const {data} = await api.get('/dashboard/today', {
    params: {dataset, branch, dept},
  });
  return data;
};

/** GET /dashboard/overdue — KPIs, days-late buckets, chips and carry-over. */
export const fetchOverdueRequest = async ({dataset = 'processing', branch, dept} = {}) => {
  const {data} = await api.get('/dashboard/overdue', {
    params: {dataset, branch, dept},
  });
  return data;
};

/**
 * GET /dashboard/sla — per-test SLA matrix over a date window.
 *
 * `range`: '1' | '7' | '30' | '90' | 'all'
 */
export const fetchSlaRequest = async ({
  dataset = 'processing',
  branch,
  dept,
  range = '30',
  q,
  page = 1,
  perPage = 25,
} = {}) => {
  const {data} = await api.get('/dashboard/sla', {
    params: {
      dataset,
      branch,
      dept,
      range,
      q: q || undefined,
      page,
      per_page: perPage,
    },
  });
  return data;
};

/**
 * GET /dashboard/reports — shift rollup for a period.
 *
 * `period`: 'daily' | 'weekly' | 'monthly'
 */
export const fetchReportsRequest = async ({
  period = 'weekly',
  dataset = 'processing',
  branch,
  dept,
} = {}) => {
  const {data} = await api.get('/dashboard/reports', {
    params: {period, dataset, branch, dept},
  });
  return data;
};

/**
 * GET /dashboard/analytics — everything the Analytics screen charts: daily
 * trend, per-phase averages and the department table, plus headline KPIs.
 *
 * `period`: 'daily' | 'weekly' | 'monthly' | 'quarterly'
 */
export const fetchAnalyticsRequest = async ({
  period = 'weekly',
  dataset = 'processing',
  branch,
  dept,
} = {}) => {
  const {data} = await api.get('/dashboard/analytics', {
    params: {period, dataset, branch, dept},
  });
  return data;
};

/**
 * GET /dashboard/departments — the departments holding data in this scope,
 * with a sample count each. Drives the department picker.
 */
export const fetchDepartmentsRequest = async ({
  dataset = 'processing',
  branch,
} = {}) => {
  const {data} = await api.get('/dashboard/departments', {
    params: {dataset, branch},
  });
  return data;
};

/** GET /branches — the branches this user may view or switch between. */
export const fetchBranchesRequest = async () => {
  const {data} = await api.get('/branches');
  return data;
};

/** GET /dashboard/samples/{id} — one sample with its six-phase timeline. */
export const fetchSampleRequest = async (id, {dataset = 'processing'} = {}) => {
  const {data} = await api.get(`/dashboard/samples/${id}`, {params: {dataset}});
  return data.sample;
};

/**
 * GET /dashboard/samples — one page of a sample list.
 *
 * scope: 'today' | 'overdue' | 'pending'
 */
export const fetchSamplesRequest = async ({
  scope = 'today',
  page = 1,
  // Larger pages mean fewer round-trips while scrolling; the server caps at 50.
  perPage = 30,
  dataset = 'processing',
  bucket,
  category,
  branch,
  dept,
  q,
} = {}) => {
  const {data} = await api.get('/dashboard/samples', {
    params: {
      scope,
      page,
      per_page: perPage,
      dataset,
      bucket: bucket || undefined,
      category: category || undefined,
      branch,
      dept,
      q: q || undefined,
    },
  });
  return data;
};
