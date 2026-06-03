import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { TaskSchedule } from "../../../services/api";
import { ScheduleDisplay } from "../../types/schedule-display";
import { Icon } from "../icon/icon";
import { canEditOrDeleteScheduleByDate, canToggleScheduleCompletionByDate } from "../../utils/schedule-utils";

@Component({
    selector: 'app-selected-day-schedules',
    templateUrl: './selected-day-schedules.html',
    imports: [CommonModule, Icon],
    styleUrls: ['../../styles/_dashboard-cards.scss', '../../styles/_buttons.scss', '../../styles/_badges.scss', './selected-day-schedules.scss']
})
export class SelectedDaySchedules {
    @Input() yesterdayDateString: string = '';
    @Input() todayDateString: string = '';

    @Input() selectedDate: Date = new Date();
    @Input() selectedDateSchedules: TaskSchedule[] = [];
    @Input() getScheduleDisplay!: (schedule: TaskSchedule) => ScheduleDisplay | null;

    @Output() completeSchedule = new EventEmitter<{ id: number, completed: boolean }>();
    @Output() editScheduleRequested = new EventEmitter<TaskSchedule>();
    @Output() deleteScheduleRequested = new EventEmitter<TaskSchedule>();

    protected canEditOrDeleteSchedule(schedule: TaskSchedule): boolean {
        return canEditOrDeleteScheduleByDate(schedule.taskDate, this.todayDateString, schedule.completed);
    }

    protected canToggleScheduleCompletion(schedule: TaskSchedule): boolean {
        return canToggleScheduleCompletionByDate(
            schedule.taskDate,
            this.todayDateString,
            this.yesterdayDateString
        );
    }
}