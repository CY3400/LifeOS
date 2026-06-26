import { addMonths } from 'date-fns';
import { TaskSchedule } from '../../services/api';
import { ActivityTrendPoint, StatsPeriod } from '../types/stats-types';
import { formatDate, formatDisplayDate } from './date-utils';

export type StatsPeriodDates = {
    startDate: string;
    displayStartDate: string;
    endDate: string;
    displayEndDate: string;
};

type StatsPeriodRange = {
    startDate: Date | null;
    endDate: Date | null;
};

function buildDailyTrend(schedules: TaskSchedule[], startDate: Date, endDate: Date): ActivityTrendPoint[] {
    const trend: ActivityTrendPoint[] = [];
    let dayLoop = new Date(startDate);

    while (dayLoop <= endDate) {
        const month = String(dayLoop.getMonth() + 1).padStart(2, '0');
        const day = String(dayLoop.getDate()).padStart(2, '0');
        const formattedDate = formatDate(dayLoop);
        const schedulesOfDay = schedules.filter(s => s.taskDate === formattedDate);

        trend.push({
            label: `${day}/${month}`,
            completedPlannings: schedulesOfDay.filter(s => s.completed === true).length,
            totalPlannings: schedulesOfDay.length
        });

        dayLoop.setDate(dayLoop.getDate() + 1);
    }

    return trend;
}

function buildMonthlyTrend(schedules: TaskSchedule[], startDate: Date, endDate: Date): ActivityTrendPoint[] {
    const trend: ActivityTrendPoint[] = [];
    let monthLoop = new Date(startDate);

    while (monthLoop <= endDate) {
        const year = monthLoop.getFullYear();
        const month = String(monthLoop.getMonth() + 1).padStart(2, '0');
        const monthKey = `${year}-${month}`;
        const schedulesOfMonth = schedules.filter(s => s.taskDate.startsWith(monthKey));

        trend.push({
            label: `${month}/${year}`,
            completedPlannings: schedulesOfMonth.filter(s => s.completed === true).length,
            totalPlannings: schedulesOfMonth.length
        });

        monthLoop = addMonths(monthLoop, 1);
    }

    return trend;
}

function buildStatsPeriodRange(period: StatsPeriod): StatsPeriodRange {
    const today = new Date();

    switch (period) {
        case 'week': {
            const day = today.getDay();
            const diffToMonday = day === 0 ? -6 : 1 - day;

            const monday = new Date(today);
            monday.setDate(today.getDate() + diffToMonday);

            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);

            return {
                startDate: monday,
                endDate: sunday
            };
        }
        case 'month': {
            const year = today.getFullYear();
            const month = today.getMonth();

            return {
                startDate: new Date(year, month, 1),
                endDate: new Date(year, month + 1, 0)
            };
        }
        case 'year': {
            return {
                startDate: new Date(today.getFullYear(), 0, 1),
                endDate: new Date(today.getFullYear(), 11, 31)
            };
        }
        case 'all':
        default: {
            return {
                startDate: null,
                endDate: null
            };
        }
    }
}

export function buildActivityTrend(schedules: TaskSchedule[], period: StatsPeriod): ActivityTrendPoint[] {
    if (period === 'all') {
        if (schedules.length === 0) {
            return [];
        }

        const dates = schedules.map(s => new Date(s.taskDate));

        const firstDay = new Date(Math.min(...dates.map(d => d.getTime())));
        const lastDay = new Date(Math.max(...dates.map(d => d.getTime())));

        const firstMonth = new Date(firstDay.getFullYear(), firstDay.getMonth(), 1);
        const lastMonth = new Date(lastDay.getFullYear(), lastDay.getMonth(), 1);

        return buildMonthlyTrend(schedules, firstMonth, lastMonth);
    }

    const range = buildStatsPeriodRange(period);

    if (range.startDate === null || range.endDate === null) {
        return [];
    }

    if (period === 'year') {
        return buildMonthlyTrend(schedules, range.startDate, range.endDate);
    }

    return buildDailyTrend(schedules, range.startDate, range.endDate);
}

export function buildStatsPeriodDates(period: StatsPeriod): StatsPeriodDates {
    const range = buildStatsPeriodRange(period);

    if (range.startDate === null || range.endDate === null) {
        return {
            startDate: '',
            displayStartDate: '',
            endDate: '',
            displayEndDate: ''
        };
    }

    return {
        startDate: formatDate(range.startDate),
        displayStartDate: formatDisplayDate(range.startDate),
        endDate: formatDate(range.endDate),
        displayEndDate: formatDisplayDate(range.endDate)
    };
}