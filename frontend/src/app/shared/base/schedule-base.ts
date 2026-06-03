import { MatSnackBar } from "@angular/material/snack-bar";
import { Api, Priority, TaskSchedule } from "../../services/api";
import { getScheduleDateValidationErrors, getScheduleErrorMessage, getScheduleSuccessMessage, getScheduleTaskValidationError, getScheduleTimeValidationError } from "../utils/schedule-utils";
import { finalize, Observable } from "rxjs";
import { formatDate } from "../utils/date-utils";

export abstract class ScheduleBase {
    scheduleErrors = {
        taskId: '',
        date: '',
        endTime: '',
        startDate: '',
        endDate: '',
        daysChosen: '',
        global: ''
    };
    deleteErrors = {
        global: ''
    };
    updateErrors = {
        global: ''
    };
    selectedTaskId: number | null = null;
    scheduleDate: string = '';
    scheduleStartTime: string = '';
    scheduleEndTime: string = '';
    schedulePriority: Priority | null = null;
    repeatSchedule: boolean = false;
    startDate: string = '';
    endDate: string = '';
    daysChosen: number[] = [];
    modifyScheduleId: number | null = null;
    scheduleSubmit: boolean = false;
    isScheduleModalOpen: boolean = false;
    isDeleteModalOpen: boolean = false;
    selectedScheduleId: number = 0;
    isUpdateModalOpen: boolean = false;

    protected abstract refreshAfterDataChange(): void;

    constructor(protected api: Api, protected snack: MatSnackBar) {}

    private resetScheduleErrors(): void {
        this.scheduleErrors = {
            global: '',
            taskId: '',
            date: '',
            endTime: '',
            startDate: '',
            endDate: '',
            daysChosen: ''
        };
    }

    private resetScheduleForm(): void {
        this.selectedTaskId = null;
        this.scheduleDate = '';
        this.scheduleStartTime = '';
        this.scheduleEndTime = '';
        this.schedulePriority = 'MEDIUM';

        this.repeatSchedule = false;
        this.startDate = '';
        this.endDate = '';
        this.daysChosen = [];

        this.modifyScheduleId = null;
    }

    private resetScheduleUiState(): void {
        this.scheduleSubmit = false;
        this.isScheduleModalOpen = false;
    }

    private resetScheduleModal(): void {
        this.resetScheduleErrors();
        this.resetScheduleForm();
        this.resetScheduleUiState();
    }

    protected setScheduleModalState(isOpen: boolean): void {
        if (isOpen) {
            this.resetScheduleErrors();
            this.scheduleSubmit = false;
            this.isScheduleModalOpen = true;
            return;
        }

        this.resetScheduleModal();
    }

    protected setModifySchedule(schedule: TaskSchedule): void {
        this.setScheduleModalState(true);
        this.modifyScheduleId = schedule.id;
        this.selectedTaskId = schedule.taskId;
        this.scheduleDate = schedule.taskDate;
        this.scheduleStartTime = schedule.startTime || '';
        this.scheduleEndTime = schedule.endTime || '';
        this.schedulePriority = schedule.priority || null;
    }

    protected toggleRepeatSchedule(): void {
        this.repeatSchedule = !this.repeatSchedule;
        if (!this.repeatSchedule) {
            this.startDate = '';
            this.endDate = '';
            this.daysChosen = [];
        }
    }

    protected toggleDay(day: number): void {
        if (this.daysChosen.includes(day)) {
            this.daysChosen = this.daysChosen.filter(d => d !== day);
        }
        else {
            this.daysChosen = [...this.daysChosen, day];
        }
    }

    private resetScheduleActionErrors(): void {
        this.deleteErrors = { global: '' };
        this.updateErrors = { global: '' };
    }

    private resetScheduleActionState(): void {
        this.isDeleteModalOpen = false;
        this.isUpdateModalOpen = false;
        this.selectedScheduleId = 0;
    }

    private resetScheduleActionModal(): void {
        this.resetScheduleActionErrors();
        this.resetScheduleActionState();
    }

    protected setScheduleActionModalState(type: 'delete' | 'update', isOpen: boolean, scheduleId: number = 0): void {
        if (!isOpen) {
            this.resetScheduleActionModal();
            return;
        }

        this.resetScheduleActionErrors();
        this.selectedScheduleId = scheduleId;

        if (type === 'delete') {
            this.isDeleteModalOpen = true;
            this.isUpdateModalOpen = false;
            return;
        }

        this.isUpdateModalOpen = true;
        this.isDeleteModalOpen = false;
    }

    private validateScheduleRequiredFields(taskId: number | null): boolean {
        this.scheduleErrors.taskId = getScheduleTaskValidationError(taskId, this.modifyScheduleId);

        return this.scheduleErrors.taskId === '';
    }

    private validateScheduleDateFields(taskDate: string): boolean {
        const errors = getScheduleDateValidationErrors(taskDate, this.modifyScheduleId, this.repeatSchedule, this.startDate, this.endDate, this.daysChosen);

        this.scheduleErrors.date = errors.date;
        this.scheduleErrors.startDate = errors.startDate;
        this.scheduleErrors.endDate = errors.endDate;
        this.scheduleErrors.daysChosen = errors.daysChosen;

        return !errors.date && !errors.startDate && !errors.endDate && !errors.daysChosen;
    }

    private validateScheduleTimes(startTime: string | null, endTime: string | null): boolean {
        const error = getScheduleTimeValidationError(startTime, endTime);

        if (error) {
            this.scheduleErrors.endTime = error;
            return false;
        }

        return true;
    }

    private validateScheduleRequest(): boolean {
        const taskId = this.selectedTaskId;
        const taskDate = this.scheduleDate;
        const startTime = this.scheduleStartTime || null;
        const endTime = this.scheduleEndTime || null;

        this.resetScheduleErrors();

        const requiredFieldsValid  = this.validateScheduleRequiredFields(taskId);
        const repeatFieldsValid  = this.validateScheduleDateFields(taskDate);
        const timesValid  = this.validateScheduleTimes(startTime, endTime);
        
        return requiredFieldsValid && repeatFieldsValid && timesValid;
    }

    protected setSuccessMessage(message: string): void {
        this.snack.open(message, '✖', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['custom-toast']
        });
    }

    private performScheduleSave(request$: Observable<unknown>, errorMessage: string, successMessage: string): void {
        request$.pipe(
            finalize(() => {
                this.scheduleSubmit = false;
            })
        ).subscribe({
            next: () => {
                this.refreshAfterDataChange();
                this.setScheduleModalState(false);
                this.setSuccessMessage(successMessage);
            },
            error: () => {
                this.scheduleErrors.global = errorMessage;
            }
        });
    }

    protected saveSchedule(): void {
        if (!this.validateScheduleRequest()) return;

        if (this.modifyScheduleId !== null) {
            const modifyScheduleId = this.modifyScheduleId;

            this.resetScheduleUiState();
            this.setScheduleActionModalState('update', true, modifyScheduleId);
            return;
        }

        const taskId = this.selectedTaskId;
        const taskDate = this.scheduleDate;
        const startTime = this.scheduleStartTime || null;
        const endTime = this.scheduleEndTime || null;
        const priority = this.schedulePriority || null;

        this.scheduleSubmit = true;
        
        if (!this.repeatSchedule) {
            this.performScheduleSave(this.api.createTaskSchedule({taskId: taskId!, taskDate, startTime, endTime, priority}), getScheduleErrorMessage('create'), getScheduleSuccessMessage('create'));
            return;
        }

        const startDate = this.startDate;
        const endDate = this.endDate;
        const daysChosen = this.daysChosen;

        this.performScheduleSave(this.api.repeatTaskSchedules(taskId!, startDate, endDate, startTime, endTime, daysChosen, priority), getScheduleErrorMessage('create'), getScheduleSuccessMessage('create'));
    }

    private deleteSchedule(id: number, request$: Observable<void>): void {
        if (id === 0) {
            this.deleteErrors.global = getScheduleErrorMessage('delete');
            return;
        }

        this.resetScheduleActionErrors();

        request$.subscribe({
            next: () => {
                this.refreshAfterDataChange();
                this.setScheduleActionModalState('delete', false);
                this.setSuccessMessage(getScheduleSuccessMessage('delete'));
            },
            error: () => {
                this.deleteErrors.global = getScheduleErrorMessage('delete');
            }
        })
    }

    private updateSchedule(id: number, requestFactory: (startTime: string | null, endTime: string | null, priority: Priority | null) => Observable<unknown>): void {
        const startTime = this.scheduleStartTime || null;
        const endTime = this.scheduleEndTime || null;
        const priority = this.schedulePriority || null;

        this.resetScheduleActionErrors();

        if (!id) {
            this.updateErrors.global = getScheduleErrorMessage('update');
            return;
        }

        requestFactory(startTime, endTime, priority).subscribe({
            next: () => {
                this.refreshAfterDataChange();
                this.setScheduleActionModalState('update', false);
                this.setScheduleModalState(false);
                this.setSuccessMessage(getScheduleSuccessMessage('update'));
            },
            error: () => {
                this.updateErrors.global = getScheduleErrorMessage('update');
            }
        });
    }

    protected deleteOneSchedule(id: number): void {
        this.deleteSchedule(id, this.api.deleteTaskSchedule(id));
    }

    protected deleteScheduleFollowing(id: number): void {
        this.deleteSchedule(id, this.api.deleteFollowing(id));
    }

    protected updateOneSchedule(id: number): void {
        this.updateSchedule(id, (startTime, endTime, priority) =>
            this.api.updateTaskSchedule(id, {
                taskDate: this.scheduleDate,
                startTime,
                endTime,
                priority
            }
        ));
    }

    protected updateScheduleFollowing(id: number): void {
        this.updateSchedule(id, (startTime, endTime, priority) =>
            this.api.updateFollowing(id, {
                taskDate: this.scheduleDate,
                startTime,
                endTime,
                priority
            }
        ));
    }

    protected completeSchedule(id: number, completed: boolean): void {
        this.scheduleErrors.global = '';

        this.api.completeTaskSchedule(id, completed).subscribe({
            next: () => {
                this.refreshAfterDataChange();

                this.setSuccessMessage(completed ? getScheduleSuccessMessage('complete') : getScheduleSuccessMessage('uncomplete'));
            },
            error: () => {
                this.scheduleErrors.global = completed ? getScheduleErrorMessage('complete') : getScheduleErrorMessage('uncomplete');
            }
        });
    }

    protected loadSchedulesByDateBase(date: Date, onSuccess: (schedules: TaskSchedule[]) => void, onError: () => void): void {
        const formattedDate = formatDate(date);

        this.api.getTaskSchedulesByDate(formattedDate).subscribe({
            next: (schedules) => {
                onSuccess(schedules);
            },
            error: () => {
                onError();
            }
        });
    }
}