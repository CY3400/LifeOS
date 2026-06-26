export type StatsPeriod = 'week' | 'month' | 'year' | 'all';

export type ActivityTrendPoint = {
  label: string;
  totalPlannings: number;
  completedPlannings: number;
};

export type StatsInsight = {
    label: string;
    value: string;
    detail: string;
}