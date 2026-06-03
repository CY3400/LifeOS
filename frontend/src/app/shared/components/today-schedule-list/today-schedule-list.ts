import { Component, EventEmitter, Input, Output } from "@angular/core";
import { TaskSchedule } from "../../../services/api";
import { CommonModule } from "@angular/common";
import { Icon } from "../icon/icon";
import { ScheduleDisplay } from "../../types/schedule-display";

@Component({
    selector: 'app-today-schedule-list',
    templateUrl: "./today-schedule-list.html",
    imports: [CommonModule, Icon],
    styleUrls: ["./today-schedule-list.scss", '../../styles/_buttons.scss', '../../styles/_badges.scss', '../../styles/_variables.scss']
})
export class TodayScheduleList {
    @Input() title: string = '';
    @Input() emptyMessage: string = '';
    @Input() schedules: TaskSchedule[] = [];
    @Input() mode: 'todo' | 'completed' = 'todo';
    @Input() getScheduleDisplay!: (schedule: TaskSchedule) => ScheduleDisplay | null;

    @Output() editScheduleRequested = new EventEmitter<TaskSchedule>();
    @Output() completeScheduleRequested = new EventEmitter<{ id: number, completed: boolean }>();
    @Output() deleteScheduleRequested = new EventEmitter<TaskSchedule>();
}