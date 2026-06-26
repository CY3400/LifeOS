import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { Api, TaskSchedule } from '../../services/api';
import { KpiSummary } from '../../shared/components/kpi-summary/kpi-summary';
import { hasAnyErrors } from '../../shared/utils/ui-utils';
import { ReviewBreakdown } from '../../shared/types/review-types';
import { ReviewBreakdownSection } from '../../shared/components/review-breakdown-section/review-breakdown-section';
import { buildAnalyticsKpi, buildPriorityKpi, buildReviewBreakdowns } from '../../shared/utils/analytics-utils';
import { AnalyticsPrioritySection } from '../../shared/components/analytics-priority-section/analytics-priority-section';

@Component({
  selector: 'app-review',
  imports: [CommonModule, FormsModule, KpiSummary, ReviewBreakdownSection, AnalyticsPrioritySection],
  templateUrl: './review.html',
  styleUrls: [
    './review.scss',
    '../../shared/styles/_page-layout.scss',
    '../../shared/styles/_errors.scss',
    '../../shared/styles/_buttons.scss',
    '../../shared/styles/_sections.scss',
    '../../shared/styles/_analytics.scss'
  ],
})
export class Review {
  startDate: string = '';
  endDate: string = '';
  isLoading: boolean = false;
  hasAnalyzed: boolean = false;
  errors = {
    global: ''
  };

  scheduleTasks: TaskSchedule[] = [];
  paginatedScheduleTasks: TaskSchedule[] = [];

  totalTasks: number = 0;
  completedTasks: number = 0;
  remainingTasks: number = 0;
  completionRate: number = 0;

  highPriority: number = 0;
  mediumPriority: number = 0;
  lowPriority: number = 0;
  completedHighPriority: number = 0;
  completedMediumPriority: number = 0;
  completedLowPriority: number = 0;

  categoryReviews: ReviewBreakdown[] = [];
  goalReviews: ReviewBreakdown[] = [];

  currentPage: number = 1;
  readonly pageSize: number = 10;

  constructor(private api: Api) {}

  protected hasAnyErrors = hasAnyErrors;

  protected get totalPages(): number {
    return Math.ceil(this.scheduleTasks.length / this.pageSize);
  }

  private resetReview(): void {
    this.errors.global = '';
    this.hasAnalyzed = false;
    this.scheduleTasks = [];
    this.paginatedScheduleTasks = [];

    this.totalTasks = 0;
    this.completedTasks = 0;
    this.remainingTasks = 0;
    this.completionRate = 0;

    this.highPriority = 0;
    this.mediumPriority = 0;
    this.lowPriority = 0;
    this.completedHighPriority = 0;
    this.completedMediumPriority = 0;
    this.completedLowPriority = 0;

    this.categoryReviews = [];
    this.goalReviews = [];

    this.currentPage = 1;
  }

  private validateDates(startDate: string, endDate: string): void {
    if (startDate === '' && endDate === '') {
      this.errors.global = 'Les dates ne peuvent pas être vides.';
      return;
    }

    if (startDate === '') {
      this.errors.global = 'La date de début ne peut pas être vide.';
      return;
    }

    if (endDate === '') {
      this.errors.global = 'La date de fin ne peut pas être vide.';
      return;
    }

    if (startDate > endDate) {
      this.errors.global = 'La date de fin ne peut pas être antérieure à la date de début.';
      return;
    }
  }

  private setPaginatedScheduleTasks(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.paginatedScheduleTasks = this.scheduleTasks.slice(startIndex, endIndex);
  }

  protected previousPage(): void {
    if (this.currentPage <= 1) {
      return;
    }

    this.currentPage--;
    this.setPaginatedScheduleTasks();
  }

  protected nextPage(): void {
    if (this.currentPage >= this.totalPages) {
      return;
    }

    this.currentPage++;
    this.setPaginatedScheduleTasks();
  }

  protected analyzeReview(): void {
    this.resetReview();
    this.validateDates(this.startDate, this.endDate);

    if (this.errors.global) {
      return;
    }

    this.isLoading = true;
    this.hasAnalyzed = true;

    this.api.getTaskSchedulesBetweenDates(this.startDate, this.endDate).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (scheduleTasks) => {
        this.scheduleTasks = scheduleTasks;
        this.currentPage = 1;
        this.setPaginatedScheduleTasks();

        const kpi = buildAnalyticsKpi(scheduleTasks);
        this.totalTasks = kpi.total;
        this.completedTasks = kpi.completed;
        this.remainingTasks = kpi.remaining;
        this.completionRate = kpi.completionRate;

        const priority = buildPriorityKpi(scheduleTasks);
        this.highPriority = priority.high;
        this.completedHighPriority = priority.completedHigh;
        this.mediumPriority = priority.medium;
        this.completedMediumPriority = priority.completedMedium;
        this.lowPriority = priority.low;
        this.completedLowPriority = priority.completedLow;

        this.categoryReviews = buildReviewBreakdowns(scheduleTasks, schedule => schedule.categoryId, schedule => schedule.categoryTitle);
        this.goalReviews = buildReviewBreakdowns(scheduleTasks, schedule => schedule.goalId, schedule => schedule.goalTitle);
      },
      error: () => {
        this.errors.global = `Erreur lors du chargement de l'analyse.`;
      }
    });
  }
}