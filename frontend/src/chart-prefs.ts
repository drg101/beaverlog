const CHART_PREFS_KEY = "chart-prefs";

export const getChartPrefs = (): ChartPrefs => {
  const prefsStr = localStorage.getItem(CHART_PREFS_KEY);
  return prefsStr ? JSON.parse(prefsStr) : { extra: [] };
};

export const setChartPrefs = (prefs: ChartPrefs) => {
  localStorage.setItem(CHART_PREFS_KEY, JSON.stringify(prefs));
};

export type ChartPrefs = {
  // Top of the page
  main?: ChartPref;
  // Saved views
  extra: ChartPref[];
};

export type ChartPref = {
  eventName: string;
  /** ms before to start window (by default) */
  timePeriod: number;
  config: ChartPrefConfig;
};

export type ChartPrefConfig = {
  type: "timeseries";
  /** Aggregation */
  perTime: "hour" | "day";
  perUser: boolean;
};
