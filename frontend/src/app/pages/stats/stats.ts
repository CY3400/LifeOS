import { Component, OnInit } from '@angular/core';
import { KpiSummary } from '../../shared/components/kpi-summary/kpi-summary';
import { Api, TaskSchedule } from '../../services/api';
import { finalize, Observable } from 'rxjs';
import { hasAnyErrors } from '../../shared/utils/ui-utils';
import { ReviewBreakdownSection } from '../../shared/components/review-breakdown-section/review-breakdown-section';
import { ReviewBreakdown } from '../../shared/types/review-types';
import { ActivityTrendPoint, StatsInsight, StatsPeriod } from '../../shared/types/stats-types';
import { ActivityTrendChart } from '../../shared/components/activity-trend-chart/activity-trend-chart';
import { buildAnalyticsKpi, buildInsightMax, buildPriorityKpi, buildReviewBreakdowns, formatInsightDetail } from '../../shared/utils/analytics-utils';
import { AnalyticsPrioritySection } from '../../shared/components/analytics-priority-section/analytics-priority-section';
import { buildActivityTrend, buildStatsPeriodDates } from '../../shared/utils/stats-utils';

@Component({
  selector: 'app-stats',
  imports: [KpiSummary, ReviewBreakdownSection, ActivityTrendChart, AnalyticsPrioritySection],
  templateUrl: './stats.html',
  styleUrls: ['./stats.scss', '../../shared/styles/_page-layout.scss', '../../shared/styles/_errors.scss', '../../shared/styles/_sections.scss', '../../shared/styles/_analytics.scss'],
})
export class Stats implements OnInit {
  isLoading: boolean = false;

  totalPlannings: number = 0;
  completedPlannings: number = 0;
  remainingPlannings: number = 0;
  completionRatePlannings: number = 0;

  highPriority: number = 0;
  completedHighPriority: number = 0;
  mediumPriority: number = 0;
  completedMediumPriority: number = 0;
  lowPriority: number = 0;
  completedLowPriority: number = 0;

  categoryReviews: ReviewBreakdown[] = [];
  goalReviews: ReviewBreakdown[] = [];

  selectedPeriod: StatsPeriod = 'all';
  startDate: string = '';
  endDate: string = '';
  displayStartDate: string = '';
  displayEndDate: string = '';

  activityTrend: ActivityTrendPoint[] = [];
  insights: StatsInsight[] = [];

  errors = {
    global: ''
  };

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.getStatistics();
  }

  protected hasAnyErrors = hasAnyErrors;

  protected changePeriod(period: StatsPeriod): void {
    if (this.selectedPeriod === period) {
      return;
    }

    this.selectedPeriod = period;
    this.getStatistics();
  }

  private getStatistics(): void {
    this.errors.global = '';
    this.isLoading = true;

    const dates = buildStatsPeriodDates(this.selectedPeriod);

    this.startDate = dates.startDate;
    this.displayStartDate = dates.displayStartDate;
    this.endDate = dates.endDate;
    this.displayEndDate = dates.displayEndDate;

    let request$: Observable<TaskSchedule[]>;

    if (this.selectedPeriod === 'all') {
      request$ = this.api.getTaskSchedules();
    }
    else {
      request$ = this.api.getTaskSchedulesBetweenDates(this.startDate, this.endDate);
    }

    request$.pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (taskSchedules) => {
        const kpi = buildAnalyticsKpi(taskSchedules);
        this.totalPlannings = kpi.total;
        this.completedPlannings = kpi.completed;
        this.remainingPlannings = kpi.remaining;
        this.completionRatePlannings = kpi.completionRate;

        const priority = buildPriorityKpi(taskSchedules);
        this.highPriority = priority.high;
        this.completedHighPriority = priority.completedHigh;
        this.mediumPriority = priority.medium;
        this.completedMediumPriority = priority.completedMedium;
        this.lowPriority = priority.low;
        this.completedLowPriority = priority.completedLow;

        this.categoryReviews = buildReviewBreakdowns(
          taskSchedules,
          schedule => schedule.categoryId,
          schedule => schedule.categoryTitle
        );
        this.goalReviews = buildReviewBreakdowns(
          taskSchedules,
          schedule => schedule.goalId,
          schedule => schedule.goalTitle
        );
        this.activityTrend = buildActivityTrend(taskSchedules, this.selectedPeriod);
        this.insights = this.buildInsights();
      },
      error: () => {
        this.errors.global = 'Erreur lors du chargement des statistiques';
        this.insights = [];
      }
    });
  }

  private buildInsights(): StatsInsight[] {
    const insights: StatsInsight[] = [];

    if (this.activityTrend.length === 0) {
      return [];
    }

    const maxActivePoints = buildInsightMax(
      this.activityTrend,
      point => point.totalPlannings
    );
    const maxTotal = maxActivePoints[0].totalPlannings;

    if (maxTotal === 0) {
      return insights;
    }

    const activePoints = this.activityTrend.filter(a => a.totalPlannings > 0);

    const percentage = buildInsightMax(
      activePoints,
      point => point.completedPlannings / point.totalPlannings * 100
    );

    const maxPercentage = percentage[0].completedPlannings / percentage[0].totalPlannings * 100;
    const roundedMaxPercentage = Math.round(maxPercentage);

    const detail = formatInsightDetail(maxActivePoints.map(point => point.label));
    const percentageDetail = formatInsightDetail(percentage.map(point => point.label));

    insights.push({
      label: maxActivePoints.length > 1 ? 'Périodes les plus actives' : 'Période la plus active',
      value: `${maxTotal} ${maxTotal > 1 ? 'plannings' : 'planning'}${maxActivePoints.length > 1 ? ' chacun(e)' : ''}`,
      detail
    });

    insights.push({
      label: 'Meilleur taux de complétion',
      value: `${roundedMaxPercentage}%${percentage.length > 1 ? ' chacun(e)' : ''}`,
      detail: percentageDetail
    });

    if (this.categoryReviews.length > 0) {
      const category = buildInsightMax(
        this.categoryReviews,
        review => review.totalPlannings
      );
      const maxCategory = category[0].totalPlannings;
      const categoryDetail = formatInsightDetail(category.map(point => point.title));

      insights.push({
        label: category.length > 1 ? 'Catégories les plus planifiées' : 'Catégorie la plus planifiée',
        value: `${maxCategory} ${maxCategory > 1 ? 'plannings' : 'planning'}${category.length > 1 ? ' chacun(e)' : ''}`,
        detail: categoryDetail
      });
    }

    if (this.goalReviews.length > 0) {
      const goal = buildInsightMax(
        this.goalReviews,
        review => review.totalPlannings
      );
      const maxGoal = goal[0].totalPlannings;
      const goalDetail = formatInsightDetail(goal.map(point => point.title));

      insights.push({
        label: goal.length > 1 ? 'Objectifs les plus planifiés' : 'Objectif le plus planifié',
        value: `${maxGoal} ${maxGoal > 1 ? 'plannings' : 'planning'}${goal.length > 1 ? ' chacun(e)' : ''}`,
        detail: goalDetail
      });
    }

    return insights;
  }
}
