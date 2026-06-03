import { Component, EventEmitter, Input, Output } from "@angular/core";
import { hasAnyErrors } from "../../utils/ui-utils";
import { Priority, Task } from "../../../services/api";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { getTaskTitle } from "../../utils/task-utils";

type ScheduleErrors = {
    taskId: string;
    date: string;
    endTime: string;
    startDate: string;
    endDate: string;
    daysChosen: string;
    global: string;
}

@Component({
    selector: 'app-schedule-form-modal',
    imports: [CommonModule, FormsModule],
    templateUrl: './schedule-form-modal.html',
    styleUrls: ['../../styles/_errors.scss', '../../styles/_modals.scss', '../../styles/_forms.scss', '../../styles/_buttons.scss', '../../styles/_repeat-schedule.scss']
})
export class ScheduleFormModal {
    @Input() isScheduleModalOpen: boolean = false;
    @Input() scheduleErrors: ScheduleErrors = {
        taskId: '',
        date: '',
        endTime: '',
        startDate: '',
        endDate: '',
        daysChosen: '',
        global: ''
    };
    @Input() modifyScheduleId: number | null = null;
    @Input() selectedTaskId: number | null = null;
    @Input() tasks: Task[] = [];
    @Input() scheduleSubmit: boolean = false;
    @Input() repeatSchedule: boolean = false;
    @Input() scheduleDate: string = '';
    @Input() todayDate: Date = new Date();
    @Input() startDate: string = '';
    @Input() endDate: string = '';
    @Input() daysChosen: number[] = [];
    @Input() scheduleStartTime: string = '';
    @Input() scheduleEndTime: string = '';
    @Input() schedulePriority: Priority | null = null;

    @Output() selectedTaskIdChange = new EventEmitter<number | null>();
    @Output() scheduleDateChange = new EventEmitter<string>();
    @Output() startDateChange = new EventEmitter<string>();
    @Output() endDateChange = new EventEmitter<string>();
    @Output() scheduleStartTimeChange = new EventEmitter<string>();
    @Output() scheduleEndTimeChange = new EventEmitter<string>();
    @Output() schedulePriorityChange = new EventEmitter<Priority | null>();
    @Output() saveSchedule = new EventEmitter<void>();
    @Output() toggleRepeatSchedule = new EventEmitter<void>();
    @Output() toggleDay = new EventEmitter<number>();
    @Output() setScheduleModalState = new EventEmitter<boolean>();

    protected hasAnyErrors = hasAnyErrors;
    protected getTaskTitle = getTaskTitle;
}