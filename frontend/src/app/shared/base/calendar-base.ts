import { CalendarEvent, CalendarView } from "angular-calendar";
import { DashboardBase } from "./dashboard-base";
import { formatDate } from "../utils/date-utils";
import { getTaskTitle } from "../utils/task-utils";
import { TaskSchedule } from "../../services/api";
import { addDays, addWeeks, addMonths, subDays, subMonths, subWeeks } from "date-fns";

export abstract class CalendarBase extends DashboardBase {
    view: CalendarView = CalendarView.Month;
    viewDate: Date = new Date();
    CalendarView = CalendarView;
    selectedDate: Date = new Date();
    calendarEvents: CalendarEvent[] = [];
    locale: string = 'fr';
    startDateBetween: Date = new Date();
    endDateBetween: Date = new Date();
    todayDate: Date = new Date();
    yesterdayDate: Date = new Date();
    todayDateString: string = '';
    yesterdayDateString: string = '';
    selectedDateSchedules: TaskSchedule[] = [];

    protected updateVisibleRange(): void {
        const current = new Date(this.viewDate);

        if (this.view === CalendarView.Month) {
            const year = current.getFullYear();
            const month = current.getMonth();

            this.startDateBetween = new Date(year, month, 1);
            this.endDateBetween = new Date(year, month + 1, 0);
            return;
        }

        if (this.view === CalendarView.Week) {
            const dayOfWeek = current.getDay();
            const diffToSunday = -dayOfWeek;

            this.startDateBetween = new Date(current);
            this.startDateBetween.setDate(current.getDate() + diffToSunday);

            this.endDateBetween = new Date(this.startDateBetween);
            this.endDateBetween.setDate(this.startDateBetween.getDate() + 6);
            return;
        }

        this.startDateBetween = new Date(this.viewDate);
        this.endDateBetween = new Date(this.viewDate);
    }

    private toCalendarEvent(schedule: TaskSchedule): CalendarEvent {
        const title = getTaskTitle(schedule.taskId, this.tasks);
        const color = schedule.completed
            ? { primary: '#64748B', secondary: '#CBD5E1' }
            : { primary: '#3B82F6', secondary: '#BFDBFE' };

        if (schedule.startTime) {
            const start = new Date(`${schedule.taskDate}T${schedule.startTime}`);
            const end = schedule.endTime ? new Date(`${schedule.taskDate}T${schedule.endTime}`) : start;

            return {
                id: schedule.id,
                start,
                end,
                cssClass: schedule.completed ? 'completed-event' : '',
                title,
                color,
                meta: schedule
            };
        }

        return {
            id: schedule.id,
            start: new Date(`${schedule.taskDate}T00:00:00`),
            cssClass: schedule.completed ? 'completed-event' : '',
            title,
            allDay: true,
            color,
            meta: schedule
        };
    }

    protected loadSchedulesBetweenDates(startDate: Date, endDate: Date): void {
        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);

        this.api.getTaskSchedulesBetweenDates(formattedStartDate, formattedEndDate).subscribe({
            next: (schedules) => {
                this.calendarEvents = schedules.map(schedule => this.toCalendarEvent(schedule));
            },
            error: () => {
                this.scheduleErrors.global = 'Erreur lors du chargement des plannings';
            }
        });
    }

    private runViewRequest(): void {
        this.updateVisibleRange();
        this.loadSchedulesBetweenDates(this.startDateBetween, this.endDateBetween);
    }

    protected loadSchedulesByDate(date: Date): void {
        this.loadSchedulesByDateBase(
            date,
            (schedules) => {
                this.selectedDateSchedules = schedules;
            },
            () => {
                this.scheduleErrors.global = 'Erreur lors du chargement des plannings';
            }
        );
    }

    protected setSelectedDay(viewDate: Date): void {
        this.viewDate = viewDate;
        this.selectedDate = viewDate;
        this.loadSchedulesByDate(viewDate);
    }

    protected goToPrevious(): void {
        if (this.view === CalendarView.Month) {
            this.viewDate = subMonths(this.viewDate, 1);
        }
        else if (this.view === CalendarView.Week) {
            this.viewDate = subWeeks(this.viewDate, 1);
        }
        else {
            this.setSelectedDay(subDays(this.viewDate, 1));
        }

        this.runViewRequest();
    }

    protected goToNext(): void {
        if (this.view === CalendarView.Month) {
            this.viewDate = addMonths(this.viewDate, 1);
        }
        else if (this.view === CalendarView.Week) {
            this.viewDate = addWeeks(this.viewDate, 1);
        }
        else {
            this.setSelectedDay(addDays(this.viewDate, 1));
        }

        this.runViewRequest();
    }

    private getYesterdayDate(): Date {
        const yesterday = new Date();

        yesterday.setDate(yesterday.getDate() - 1);

        return yesterday;
    }

    protected initializeDates(): void {
        this.todayDate = new Date();
        this.yesterdayDate = this.getYesterdayDate();
        this.todayDateString = formatDate(this.todayDate);
        this.yesterdayDateString = formatDate(this.yesterdayDate);
    }

    protected goToToday(): void {
        this.initializeDates();

        const today = new Date(this.todayDate);

        this.setSelectedDay(today);
        this.runViewRequest();
    }

    protected setView(view: CalendarView): void {
        this.view = view;
        this.runViewRequest();
    }
}