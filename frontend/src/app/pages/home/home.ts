import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Api, Task, Goal, TaskSchedule } from "../../services/api";
import { finalize, Observable } from "rxjs";
import { CalendarEvent, CalendarWeekViewComponent, CalendarView, CalendarMonthViewComponent, CalendarDayViewComponent, CalendarDatePipe } from "angular-calendar";
import { addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from "date-fns";

@Component({
    selector: 'app-home',
    templateUrl: './home.html',
    styleUrls: ['./home.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, CalendarWeekViewComponent, CalendarMonthViewComponent, CalendarDayViewComponent, CalendarDatePipe]
})
export class Home implements OnInit {
    goals: Goal[] = [];
    tasks: Task[] = [];

    totalTasks: number = 0;
    completedTasks: number = 0;
    completionRate: number = 0;

    newGoalTitle: string = '';
    goalSubmit: boolean = false;
    modifyGoalId: number | null = null;
    modifyGoalTitle: string = '';

    isTaskModalOpen: boolean = false;
    taskTitle: string = '';
    taskSubmit: boolean = false;
    selectedGoalId: string | null = null;
    modifyTaskId: number | null = null;

    isScheduleModalOpen: boolean = false;
    scheduleSubmit: boolean = false;
    modifyScheduleId: number | null = null;
    selectedTaskId: string =  '';
    scheduleDate: string = '';
    scheduleStartTime: string = '';
    scheduleEndTime: string = '';

    repeatSchedule: boolean = false;
    startDate: string = '';
    endDate: string = '';
    daysChosen: number[] = [];

    todayDate: Date = new Date();

    isDeleteModalOpen: boolean = false;
    selectedScheduleId: number = 0;

    isUpdateModalOpen: boolean = false;

    viewDate: Date = new Date();
    view: CalendarView = CalendarView.Week;
    CalendarView = CalendarView;
    selectedDate: Date = new Date();

    selectedDateSchedules: TaskSchedule[] = [];
    calendarEvents: CalendarEvent[] = [];
    locale: string = 'fr';

    startDateBetween: Date = new Date();
    endDateBetween: Date = new Date();

    taskErrors = {
        title: '',
        global: ''
    };

    goalErrors = {
        global: ''
    }

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

    constructor(private api: Api) {}

    ngOnInit() {
        this.refreshHome();
    }

    private refreshHome() {
        this.api.today().subscribe({
            next: (dashboard) => {
                this.goals = dashboard.goals;
                this.tasks = dashboard.tasks;
                this.totalTasks = dashboard.totalTasks;
                this.completedTasks = dashboard.completedTasks;
                this.completionRate = dashboard.completionRate;

                this.loadSchedulesByDate(this.selectedDate);
                this.updateVisibleRange();
                this.loadSchedulesBetweenDates(this.startDateBetween, this.endDateBetween);
            },
            error: () => {
                console.error("Erreur lors du chargement du dashboard");
            }
        });
    }

    private updateVisibleRange(): void {
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

    private resetTaskErrors(): void {
        this.taskErrors.title = '';
        this.taskErrors.global = '';
    }

    private resetScheduleErrors(): void {
        this.scheduleErrors.taskId = '';
        this.scheduleErrors.date = '';
        this.scheduleErrors.endTime = '';
        this.scheduleErrors.startDate = '';
        this.scheduleErrors.endDate = '';
        this.scheduleErrors.daysChosen = '';
        this.scheduleErrors.global = '';
    }

    private resetModalErrors(type: 'delete' | 'update'): void {
        if (type === 'delete') {
            this.deleteErrors.global = '';
            return;
        }

        this.updateErrors.global = '';
    }

    protected hasAnyErrors(errors: Record<string, string>): boolean {
        return Object.values(errors).some(e => e !== '');
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    protected toggleRepeatSchedule(): void {
        this.repeatSchedule = !this.repeatSchedule;
        if (!this.repeatSchedule) {
            this.startDate = '';
            this.endDate = '';
            this.daysChosen = [];
        }
    }

    protected getTaskTitle(taskId: number): string {
        const task = this.tasks.find(t => t.id === taskId);
        return task ? task.title : 'Tâche inconnue';
    }

    protected formatTime(time: string | null): string {
        return time ? time.slice(0, 5) : '';
    }

    protected toggleDay(day: number): void {
        if (this.daysChosen.includes(day)) {
            this.daysChosen = this.daysChosen.filter(d => d !== day);
        }
        else {
            this.daysChosen = [...this.daysChosen, day];
        }
    }

    protected setTaskModalState(isOpen: boolean): void {
        this.isTaskModalOpen = isOpen;
        this.resetTaskErrors();
        this.taskTitle = '';
        this.selectedGoalId = null;
        this.modifyTaskId = null;
    }

    protected setScheduleActionModalState(type: 'delete' | 'update', isOpen: boolean, scheduleId: number = 0): void {
        if (type === 'delete') {
            this.isDeleteModalOpen = isOpen;
        }
        else {
            this.isUpdateModalOpen = isOpen;
        }

        if (type === 'update' && isOpen === false) {
            this.modifyScheduleId = null;
        }

        this.resetModalErrors(type);
        this.selectedScheduleId = isOpen ? scheduleId : 0;
    }

    protected setGoalToModify(id: number | null, title: string | null): void {
        this.modifyGoalId = id;
        this.modifyGoalTitle = title || '';
    }

    protected modifyGoal(id: number): void {
        const title = this.modifyGoalTitle.trim();

        if (title) {
            this.api.modifyGoal(id, title).pipe(
                finalize(() => {
                    this.modifyGoalId = null;
                    this.modifyGoalTitle = '';
                })
            ).subscribe({
                next: (goal) => {
                    const index = this.goals.findIndex(g => g.id === id);
                    if (index !== -1) {
                        this.goals[index] = goal;
                    }
                },
                error: () => {
                    this.goalErrors.global = "Erreur lors de la modification de l'objectif";
                }
            });
        }
    }

    protected deleteGoal(id: number): void {
        this.api.deleteGoal(id).subscribe({
            next: () => {
                this.goals = this.goals.filter(g => g.id !== id);
            },
            error: () => {
                this.goalErrors.global = "Erreur lors de la suppression de l'objectif";
            }
        });
    }

    protected submitGoal(): void {
        const title = this.newGoalTitle.trim();

        if (title) {
            this.goalSubmit = true;
            this.api.addGoal(title).pipe(
                finalize(() => {
                    this.goalSubmit = false;
                })
            ).subscribe({
                next: (goal) => {
                    this.goals.push(goal);
                    this.newGoalTitle = '';
                },
                error: () => {
                    this.goalErrors.global = "Erreur lors de l'ajout de l'objectif";
                }
            });
        }
    }

    protected deleteTask(id: number): void {
        this.api.deleteTask(id).subscribe({
            next: () => {
                this.refreshHome();
            },
            error: () => {
                this.taskErrors.global = "Erreur lors de la suppression de la tâche";
            }
        });
    }

    private performTaskSave(request$: Observable<Task>, errorMessage: string): void {
        request$.pipe(
            finalize(() => {
                this.taskSubmit = false;
            })
        ).subscribe({
            next: () => {
                this.refreshHome();
                this.setTaskModalState(false);
            },
            error: () => {
                this.taskErrors.global = errorMessage;
            }
        });
    }

    protected saveTask(): void {
        const title = this.taskTitle.trim();
        const goalId = this.selectedGoalId !== '' && this.selectedGoalId ? parseInt(this.selectedGoalId, 10) : null;

        this.resetTaskErrors();

        if (title === '') {
            this.taskErrors.title = "Le titre ne peut pas être vide";
            return;
        }

        this.taskSubmit = true;

        if (this.modifyTaskId !== null) {
            this.performTaskSave(this.api.updateTask(this.modifyTaskId, title, goalId), "Une erreur s'est produite lors de la modification de la tâche.");
        } 
        else {
            this.performTaskSave(this.api.createTask(title, goalId), "Une erreur s'est produite lors de la création de la tâche.");
        }
    }

    protected setModifyTask(id: number, title: string, goalId: number | null): void {
        this.setTaskModalState(true);
        this.taskTitle = title;
        this.selectedGoalId = goalId?.toString() || null;
        this.modifyTaskId = id;
    }

    private resetScheduleModalForm(): void {
        const today = new Date();

        this.resetScheduleErrors();
        this.selectedTaskId = '';
        this.scheduleDate = this.formatDate(today);
        this.scheduleStartTime = '';
        this.scheduleEndTime = '';
        this.modifyScheduleId = null;
        this.repeatSchedule = false;
        this.startDate = '';
        this.endDate = '';
        this.daysChosen = [];
    }

    protected setScheduleModalState(isOpen: boolean): void {
        this.isScheduleModalOpen = isOpen;
        this.resetScheduleModalForm();
    }

    protected setModifySchedule(schedule: TaskSchedule): void {
        this.setScheduleModalState(true);
        this.modifyScheduleId = schedule.id;
        this.selectedTaskId = schedule.taskId.toString();
        this.scheduleDate = schedule.taskDate;
        this.scheduleStartTime = schedule.startTime || '';
        this.scheduleEndTime = schedule.endTime || '';
    }

    private performScheduleSave(request$: Observable<unknown>, errorMessage: string): void {
        request$.pipe(
            finalize(() => {
                this.scheduleSubmit = false;
            })
        ).subscribe({
            next: () => {
                this.refreshHome();
                this.setScheduleModalState(false);
            },
            error: () => {
                this.scheduleErrors.global = errorMessage;
            }
        });
    }

    private validateScheduleRequest(): boolean {
        const taskId = this.selectedTaskId ? parseInt(this.selectedTaskId, 10) : null;
        const taskDate = this.scheduleDate;
        const startTime = this.scheduleStartTime || null;
        const endTime = this.scheduleEndTime || null;

        let isValid = true;

        this.resetScheduleErrors();

        if (!taskId) {
            this.scheduleErrors.taskId = "La tâche est obligatoire";
            isValid = false;
        }

        if (!taskDate && !this.repeatSchedule) {
            this.scheduleErrors.date = "La date est obligatoire";
            isValid = false;
        }

        if (this.repeatSchedule && !this.startDate) {
            this.scheduleErrors.startDate = "La date de début est obligatoire pour une répétition";
            isValid = false;
        }

        if (this.repeatSchedule && !this.endDate) {
            this.scheduleErrors.endDate = "La date de fin est obligatoire pour une répétition";
            isValid = false;
        }

        if (this.repeatSchedule && !this.daysChosen.length) {
            this.scheduleErrors.daysChosen = "Au moins un jour doit être choisi pour une répétition";
            isValid = false;
        }

        if (this.repeatSchedule && this.startDate && this.endDate && this.endDate < this.startDate) {
            this.scheduleErrors.endDate = "La date de fin doit être après la date de début";
            isValid = false;
        }

        if (endTime && !startTime) {
            this.scheduleErrors.endTime = "L'heure de début est requise si une heure de fin est fournie";
            isValid = false;
        }

        if (startTime && endTime && endTime <= startTime) {
            this.scheduleErrors.endTime = "L'heure de fin doit être après l'heure de début";
            isValid = false;
        }

        return isValid;
    }

    protected saveSchedule(): void {
        const taskId = this.selectedTaskId ? parseInt(this.selectedTaskId, 10) : null;
        const taskDate = this.scheduleDate;
        const startTime = this.scheduleStartTime || null;
        const endTime = this.scheduleEndTime || null;

        if (!this.validateScheduleRequest()) return;

        this.scheduleSubmit = true;

        if (this.modifyScheduleId !== null) {
            const modifyScheduleId = this.modifyScheduleId;

            this.setScheduleModalState(false);
            this.scheduleSubmit = false;
            this.setScheduleActionModalState('update', true, modifyScheduleId);
            return;
        }
        
        if (!this.repeatSchedule) {
            this.performScheduleSave(this.api.createTaskSchedule(taskId!, taskDate, startTime, endTime), "Une erreur s'est produite lors de la création du planning.");
            return;
        }

        const startDate = this.startDate;
        const endDate = this.endDate;
        const daysChosen = this.daysChosen;

        this.performScheduleSave(this.api.repeatTaskSchedules(taskId!, startDate, endDate, startTime, endTime, daysChosen), "Une erreur s'est produite lors de la création des plannings répétés.");
    }

    private deleteSchedule(id: number, request$: Observable<void>): void {
        if (id !== 0) {
            this.resetModalErrors('delete');

            request$.subscribe({
                next: () => {
                    this.refreshHome();
                    this.setScheduleActionModalState('delete', false);
                },
                error: () => {
                    this.deleteErrors.global = "Une erreur s'est produite lors de la suppression du planning.";
                }
            })
        }
        else {
            this.deleteErrors.global = "Une erreur s'est produite lors de la suppression du planning.";
        }
    }

    private updateSchedule(id: number, requestFactory: (taskId: number, startTime: string | null, endTime: string | null) => Observable<unknown>): void {
        const taskId = this.selectedTaskId ? parseInt(this.selectedTaskId, 10) : null;
        const startTime = this.scheduleStartTime || null;
        const endTime = this.scheduleEndTime || null;

        this.resetModalErrors('update');

        if (!id || !taskId) {
            this.updateErrors.global = "Une erreur s'est produite lors de la modification du planning.";
            return;
        }

        requestFactory(taskId, startTime, endTime).subscribe({
            next: () => {
                this.refreshHome();
                this.setScheduleActionModalState('update', false);
            },
            error: () => {
                this.updateErrors.global = "Une erreur s'est produite lors de la modification du planning.";
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
        this.updateSchedule(id, (taskId, startTime, endTime) => this.api.updateTaskSchedule(id, taskId, this.scheduleDate, startTime, endTime));
    }

    protected updateScheduleFollowing(id: number): void {
        this.updateSchedule(id, (taskId, startTime, endTime) => this.api.updateFollowing(id, taskId, this.scheduleDate, startTime, endTime));
    }

    protected completeSchedule(id: number, completed: boolean): void {
        this.api.completeTaskSchedule(id, completed).subscribe({
            next: () => {
                this.refreshHome();
            },
            error: () => {
                this.scheduleErrors.global = "Erreur lors de la complétion du planning";
            }
        });
    }

    protected setView(view: CalendarView): void {
        this.view = view;
        this.updateVisibleRange();
        this.loadSchedulesBetweenDates(this.startDateBetween, this.endDateBetween);
    }

    private loadSchedulesByDate(date: Date): void {
        const formattedDate = this.formatDate(date);

        this.api.getTaskSchedulesByDate(formattedDate).subscribe({
            next: (schedules) => {
                this.selectedDateSchedules = schedules;
            },
            error: () => {
                this.scheduleErrors.global = "Erreur lors du chargement des plannings pour la date sélectionnée";
            }
        });
    }

    private loadSchedulesBetweenDates(startDate: Date, endDate: Date): void {
        const formattedStartDate = this.formatDate(startDate);
        const formattedEndDate = this.formatDate(endDate);

        this.api.getTaskSchedulesBetweenDates(formattedStartDate, formattedEndDate).subscribe({
            next: (schedules) => {
                this.calendarEvents = schedules.map((schedule): CalendarEvent => {
                    const title = this.getTaskTitle(schedule.taskId);

                    if (schedule.startTime) {
                        const start = new Date(`${schedule.taskDate}T${schedule.startTime}`);
                        const end = schedule.endTime ? new Date(`${schedule.taskDate}T${schedule.endTime}`) : start;

                        return {
                            id: schedule.id,
                            start,
                            end,
                            cssClass: schedule.completed ? 'completed-event' : '',
                            title,
                            color: schedule.completed ? { primary: '#64748B', secondary: '#CBD5E1'} : { primary: '#3B82F6', secondary: '#BFDBFE'},
                            meta: schedule
                        };
                    }

                    return {
                        id: schedule.id,
                        start: new Date(`${schedule.taskDate}T00:00:00`),
                        cssClass: schedule.completed ? 'completed-event' : '',
                        title,
                        allDay: true,
                        color: schedule.completed ? { primary: '#64748B', secondary: '#CBD5E1'} : { primary: '#3B82F6', secondary: '#BFDBFE'},
                        meta: schedule
                    };
                });
            },
            error: () => {
                this.scheduleErrors.global = "Erreur lors du chargement des plannings pour la date sélectionnée";
            }
        });
    }

    protected onDayClicked(date: Date): void {
        this.selectedDate = date;
        this.viewDate = date;
        this.loadSchedulesByDate(date);
    }

    private runViewRequest(): void {
        this.updateVisibleRange();
        this.loadSchedulesBetweenDates(this.startDateBetween, this.endDateBetween);
    }

    private setSelectedDay(viewDate: Date): void {
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

    protected goToToday(): void {
        const today = new Date();
        this.setSelectedDay(today);
        this.runViewRequest();
    }
}