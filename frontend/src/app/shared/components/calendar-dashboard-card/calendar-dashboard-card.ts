import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Icon } from "../icon/icon";
import { CalendarDatePipe, CalendarDayViewComponent, CalendarEvent, CalendarMonthViewComponent, CalendarView, CalendarWeekViewComponent } from "angular-calendar";

@Component({
    selector: "app-calendar-dashboard-card",
    templateUrl: "./calendar-dashboard-card.html",
    imports: [Icon, CalendarDatePipe, CalendarMonthViewComponent, CalendarWeekViewComponent, CalendarDayViewComponent],
    styleUrls: ['./calendar-dashboard-card.scss', '../../styles/_buttons.scss']
})
export class CalendarDashboardCard {
    @Input() viewDate: Date = new Date();
    @Input() view: CalendarView = CalendarView.Month;
    @Input() calendarEvents: CalendarEvent[] = [];
    @Input() locale: string = 'fr';

    @Output() createScheduleRequested = new EventEmitter<void>();
    @Output() previousRequested = new EventEmitter<void>();
    @Output() todayRequested = new EventEmitter<void>();
    @Output() nextRequested = new EventEmitter<void>();
    @Output() viewChangeRequested = new EventEmitter<CalendarView>();
    @Output() selectedDayChangeRequested = new EventEmitter<Date>();

    protected CalendarView = CalendarView;
}