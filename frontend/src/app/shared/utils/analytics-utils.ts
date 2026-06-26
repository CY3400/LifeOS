import { TaskSchedule } from '../../services/api';
import { ReviewBreakdown } from '../types/review-types';

export type AnalyticsKpi = {
    total: number;
    completed: number;
    remaining: number;
    completionRate: number;
};

export type AnalyticsPriorityKpi = {
    high: number;
    completedHigh: number;
    medium: number;
    completedMedium: number;
    low: number;
    completedLow: number;
};

export function buildAnalyticsKpi(schedules: TaskSchedule[]): AnalyticsKpi {
    const total = schedules.length;
    const completed = schedules.filter(s => s.completed === true).length;

    return {
        total,
        completed,
        remaining: total - completed,
        completionRate: total > 0 ? completed / total * 100 : 0
    };
}

export function buildPriorityKpi(schedules: TaskSchedule[]): AnalyticsPriorityKpi {
    const high = schedules.filter(s => s.priority === 'HIGH');
    const medium = schedules.filter(s => s.priority === 'MEDIUM');
    const low = schedules.filter(s => s.priority === 'LOW');

    return {
        high: high.length,
        completedHigh: high.filter(s => s.completed === true).length,
        medium: medium.length,
        completedMedium: medium.filter(s => s.completed === true).length,
        low: low.length,
        completedLow: low.filter(s => s.completed === true).length
    };
}

export function buildReviewBreakdowns(schedules: TaskSchedule[], getId: (schedule: TaskSchedule) => number | null, getTitle: (schedule: TaskSchedule) => string | null): ReviewBreakdown[] {
    const reviews: ReviewBreakdown[] = [];

    for (const schedule of schedules) {
        const id = getId(schedule);
        const title = getTitle(schedule);

        if (id === null || title === null) {
            continue;
        }

        let review = reviews.find(r => r.id === id);

        if (!review) {
            const newReview: ReviewBreakdown = {
                id,
                title,
                totalPlannings: 0,
                completedPlannings: 0,
                remainingPlannings: 0,
                completionRate: 0
            };

            reviews.push(newReview);
            review = newReview;
        }

        review.totalPlannings++;

        if (schedule.completed === true) {
            review.completedPlannings++;
        }
    }

    for (const review of reviews) {
        review.remainingPlannings = review.totalPlannings - review.completedPlannings;
        review.completionRate = review.totalPlannings > 0 ? review.completedPlannings / review.totalPlannings * 100 : 0;
    }

    return reviews.sort((a, b) => b.totalPlannings - a.totalPlannings || b.completedPlannings - a.completedPlannings || a.title.localeCompare(b.title));
}

export function formatInsightDetail(labels: string[]): string {
    if (labels.length === 0) {
        return '';
    }

    const displayedLabels = labels.slice(0, 3).join(', ');
    const remainingCount = labels.length - 3;

    return remainingCount > 0 ? `${displayedLabels} + ${remainingCount} ${remainingCount > 1 ? 'autres' : 'autre'}` : displayedLabels;
}

export function buildInsightMax<T>(items: T[], getValue: (item: T) => number): T[] {
    if (items.length === 0) {
        return [];
    }

    const max = Math.max(...items.map(item => getValue(item)));

    return items.filter(item => getValue(item) === max);
}