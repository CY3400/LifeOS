import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Api, Task, Goal, TaskSchedule, Priority, Category, TaskScheduleRequest } from "../../services/api";
import { finalize, Observable } from "rxjs";
import { CalendarEvent, CalendarWeekViewComponent, CalendarView, CalendarMonthViewComponent, CalendarDayViewComponent, CalendarDatePipe } from "angular-calendar";
import { addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from "date-fns";
import { MatSnackBar } from "@angular/material/snack-bar";

type EntityType = 'category' | 'goal' | 'task' | 'schedule';

type EntityAction = 'create' | 'update' | 'delete' | 'complete' | 'load' | 'archive';

type ScheduleDisplay = {
    taskTitle: string;
    timeLabel: string;
    priorityLabel: string;
    categoryTitle: string;
}

type GoalDisplay = {
    categoryTitle: string;
}

type Warning = 'category' | 'task' | 'goal';

@Component({
    selector: 'app-home',
    templateUrl: './home.html',
    styleUrls: ['./home.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, CalendarWeekViewComponent, CalendarMonthViewComponent, CalendarDayViewComponent, CalendarDatePipe]
})
export class Home implements OnInit {
    //Propriétés
    //calendrier/dasboard
    view: CalendarView = CalendarView.Month;
    viewDate: Date = new Date();
    CalendarView = CalendarView;
    selectedDate: Date = new Date();
    calendarEvents: CalendarEvent[] = [];
    locale: string = 'fr';
    totalTasks: number = 0;
    completedTasks: number = 0;
    completionRate: number = 0;

    //catégories
    categories: Category[] = [];
    newCategoryTitle: string = '';
    categorySubmit: boolean = false;
    modifyCategoryId: number | null = null;
    modifyCategoryTitle: string = '';
    categoryErrors = {
        global: '',
        title: ''
    }

    //objectifs
    goals: Goal[] = [];
    goalTitle: string = '';
    goalCategoryId: number | null = null;
    goalSubmit: boolean = false;
    isGoalModalOn: boolean = false;
    modifyGoalId: number | null = null;
    goalErrors = {
        global: '',
        title: '',
        category: ''
    }

    //tâches
    tasks: Task[] = [];
    isTaskModalOpen: boolean = false;
    taskTitle: string = '';
    taskDescription: string = '';
    taskSubmit: boolean = false;
    selectedGoalId: number | null = null;
    modifyTaskId: number | null = null;
    selectedTaskCategoryId: number | null = null;
    taskErrors = {
        title: '',
        global: ''
    };

    //planning
    selectedDateSchedules: TaskSchedule[] = [];
    isScheduleModalOpen: boolean = false;
    scheduleSubmit: boolean = false;
    modifyScheduleId: number | null = null;
    selectedTaskId: number | null = null;
    scheduleDate: string = '';
    scheduleStartTime: string = '';
    scheduleEndTime: string = '';
    schedulePriority: Priority | null = null;
    repeatSchedule: boolean = false;
    startDate: string = '';
    endDate: string = '';
    daysChosen: number[] = [];
    scheduleErrors = {
        taskId: '',
        date: '',
        endTime: '',
        startDate: '',
        endDate: '',
        daysChosen: '',
        global: ''
    };

    //warnings/action modals
    isWarningOpen: boolean = false;
    warningId: number | null = null;
    warningTitle: string = '';
    warningType: Warning | null = null;
    warningError: string = '';
    warningMessage: string = '';
    canSuggestArchive: boolean = false;
    isDeleteModalOpen: boolean = false;
    selectedScheduleId: number = 0;
    isUpdateModalOpen: boolean = false;
    deleteErrors = {
        global: ''
    };
    updateErrors = {
        global: ''
    };

    todayDate: Date = new Date();
    yesterdayDate: Date = new Date();
    todayDateString: string = '';
    yesterdayDateString: string = '';
    startDateBetween: Date = new Date();
    endDateBetween: Date = new Date();

    //constructor
    constructor(private api: Api, private snack: MatSnackBar) {}

    //lifecycle
    ngOnInit() {
        this.initializeDates();
        this.refreshHome();
    }

    //load/refresh
    private refreshHome() {
        this.api.today().subscribe({
            next: (dashboard) => {
                this.goals = dashboard.goals;
                this.tasks = dashboard.tasks;
                this.categories = dashboard.categories;
                this.totalTasks = dashboard.totalTasks;
                this.completedTasks = dashboard.completedTasks;
                this.completionRate = dashboard.completionRate;

                this.loadSchedulesByDate(this.selectedDate);
                this.updateVisibleRange();
                this.loadSchedulesBetweenDates(this.startDateBetween, this.endDateBetween);
            },
            error: () => {
                console.error(this.getFallbackMessage('dashboardLoadError'));
            }
        });
    }

    private loadSchedulesByDate(date: Date): void {
        const formattedDate = this.formatDate(date);

        this.api.getTaskSchedulesByDate(formattedDate).subscribe({
            next: (schedules) => {
                this.selectedDateSchedules = schedules;
            },
            error: () => {
                this.scheduleErrors.global = this.getGenericErrorMessage('schedule', 'load');
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
                this.scheduleErrors.global = this.getGenericErrorMessage('schedule', 'load');
            }
        });
    }

    //navigation calendrier/dashboard helpers
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
        this.initializeDates();

        const today = new Date(this.todayDate);

        this.setSelectedDay(today);
        this.runViewRequest();
    }

    protected setView(view: CalendarView): void {
        this.view = view;
        this.updateVisibleRange();
        this.loadSchedulesBetweenDates(this.startDateBetween, this.endDateBetween);
    }

    protected onDayClicked(date: Date): void {
        this.selectedDate = date;
        this.viewDate = date;
        this.loadSchedulesByDate(date);
    }

    //CRUD
    //catégories
    protected submitCategory(): void {
        this.resetCategoryErrors();

        const title = this.newCategoryTitle.trim();

        if (title == '') {
            this.categoryErrors.title = this.getValidationMessage('categoryTitleRequired');
            return;
        }

        if(title) {
            this.categorySubmit = true;
            this.api.createCategory(title).pipe(
                finalize(() => {
                    this.categorySubmit = false;
                })
            ).subscribe({
                next: (category) => {
                    this.categories.push(category);
                    this.resetCategoryForm();
                    this.setSuccessMessage(this.getSuccessMessage('category', 'create'));
                },
                error: () => {
                    this.categoryErrors.global = this.getGenericErrorMessage('category', 'create');
                }
            });
        }
    }

    protected modifyCategory(id: number): void {
        this.resetCategoryErrors();

        const title = this.modifyCategoryTitle.trim();

        if (title == '') {
            this.categoryErrors.title = this.getValidationMessage('categoryTitleRequired');
            return;
        }

        if (title) {
            this.api.updateCategory(id, title).subscribe({
                next: (category) => {
                    const index = this.categories.findIndex(c => c.id === id);
                    if (index !== -1) {
                        this.categories[index] = category;
                        this.resetCategoryState();
                        this.setSuccessMessage(this.getSuccessMessage('category', 'update'));
                    }
                },
                error: () => {
                    this.categoryErrors.global = this.getGenericErrorMessage('category', 'update');
                }
            });
        }
    }

    protected setCategoryToModify(id: number | null, title: string | null): void {
        this.modifyCategoryId = id;
        this.modifyCategoryTitle = title || '';
    }

    //Objectifs
    protected openCreateGoalModal(): void {
        this.resetGoalModal();
        this.isGoalModalOn = true;
    }

    protected setGoalToModify(id: number, title: string, categoryId: number | null): void {
        this.modifyGoalId = id;
        this.goalTitle = title;
        this.goalCategoryId = categoryId;
        this.setGoalModalState(true);
    }

    protected saveGoal(): void {
        this.resetGoalErrors();

        const title = this.goalTitle.trim();
        const categoryId = this.goalCategoryId;

        if (title === '') {
            this.goalErrors.title = "Le nom de l'objectif est obligatoire";
            return;
        }

        if (categoryId === null) {
            this.goalErrors.category = this.getValidationMessage("goalCategoryRequired");
            return;
        }

        this.goalSubmit = true;

        const request$ = this.modifyGoalId !== null ? this.api.updateGoal(this.modifyGoalId, title, categoryId) : this.api.createGoal(title, categoryId);

        request$.pipe(
            finalize(() => {
                this.goalSubmit = false;
            })
        ).subscribe({
            next: (goal) => {
                if (this.modifyGoalId !== null) {
                    const index = this.goals.findIndex(g => g.id === goal.id);
                    if (index !== -1) {
                        this.goals[index] = goal;
                        this.setSuccessMessage(this.getSuccessMessage('goal', 'update'));
                    }
                } else {
                    this.goals.push(goal);
                    this.setSuccessMessage(this.getSuccessMessage('goal', 'create'));
                }

                this.setGoalModalState(false);
            },
            error: () => {
                this.goalErrors.global = this.modifyGoalId !== null ? this.getGenericErrorMessage('goal', 'update') : this.getGenericErrorMessage('goal', 'create');
            }
        });
    }

    protected setGoalModalState(isOpen: boolean): void {
        if(isOpen) {
            this.resetGoalErrors();
            this.goalSubmit = false;
            this.isGoalModalOn = true;
            return;
        }

        this.resetGoalModal();
    }

    //Tâches
    protected setTaskModalState(isOpen: boolean): void {
        if(isOpen) {
            this.resetTaskErrors();
            this.taskSubmit = false;
            this.isTaskModalOpen = true;
            return;
        }

        this.resetTaskModal();
    }

    protected setModifyTask(id: number, title: string, description: string, goalId: number | null, categoryId: number | null): void {
        this.setTaskModalState(true);
        this.taskTitle = title;
        this.taskDescription = description;
        this.selectedGoalId = goalId || null;
        this.selectedTaskCategoryId = categoryId || null;
        this.modifyTaskId = id;
    }

    protected saveTask(): void {
        const title = this.taskTitle.trim();

        this.resetTaskErrors();

        if (title === '') {
            this.taskErrors.title = this.getValidationMessage('taskTitleRequired');
            return;
        }

        this.taskSubmit = true;

        if (this.modifyTaskId !== null) {
            this.performTaskSave(this.api.updateTask(this.modifyTaskId, title, this.taskDescription, this.selectedGoalId, this.selectedTaskCategoryId), this.getGenericErrorMessage('task', 'update'), this.getSuccessMessage('task', 'update'));
        } 
        else {
            this.performTaskSave(this.api.createTask(title, this.taskDescription , this.selectedGoalId, this.selectedTaskCategoryId), this.getGenericErrorMessage('task', 'create'), this.getSuccessMessage('task', 'create'));
        }
    }

    private performTaskSave(request$: Observable<Task>, errorMessage: string, successMessage: string): void {
        request$.pipe(
            finalize(() => {
                this.taskSubmit = false;
            })
        ).subscribe({
            next: () => {
                this.refreshHome();
                this.setTaskModalState(false);
                this.setSuccessMessage(successMessage);
            },
            error: () => {
                this.taskErrors.global = errorMessage;
            }
        });
    }

    protected onTaskGoalChange(): void {
        if (this.selectedGoalId !== null) {
            this.selectedTaskCategoryId = null;
        }
    }

    protected onTaskCategoryChange(): void {
        if (this.selectedTaskCategoryId !== null) {
            this.selectedGoalId = null;
        }
    }

    //Plannings
    protected setScheduleModalState(isOpen: boolean): void {
        if(isOpen) {
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

    protected saveSchedule(): void {
        const taskId = this.selectedTaskId;
        const taskDate = this.scheduleDate;
        const startTime = this.scheduleStartTime || null;
        const endTime = this.scheduleEndTime || null;
        const priority = this.schedulePriority || null;

        if (!this.validateScheduleRequest()) return;

        this.scheduleSubmit = true;

        if (this.modifyScheduleId !== null) {
            const modifyScheduleId = this.modifyScheduleId;

            this.resetScheduleUiState();
            this.setScheduleActionModalState('update', true, modifyScheduleId);
            return;
        }
        
        if (!this.repeatSchedule) {
            this.performScheduleSave(this.api.createTaskSchedule({taskId: taskId!, taskDate, startTime, endTime, priority}), this.getGenericErrorMessage('schedule', 'create'), this.getSuccessMessage('schedule', 'create'));
            return;
        }

        const startDate = this.startDate;
        const endDate = this.endDate;
        const daysChosen = this.daysChosen;

        this.performScheduleSave(this.api.repeatTaskSchedules(taskId!, startDate, endDate, startTime, endTime, daysChosen, priority), this.getGenericErrorMessage('schedule', 'create'), this.getSuccessMessage('schedule', 'create'));
    }

    private performScheduleSave(request$: Observable<unknown>, errorMessage: string, successMessage: string): void {
        request$.pipe(
            finalize(() => {
                this.scheduleSubmit = false;
            })
        ).subscribe({
            next: () => {
                this.refreshHome();
                this.setScheduleModalState(false);
                this.setSuccessMessage(successMessage);
            },
            error: () => {
                this.scheduleErrors.global = errorMessage;
            }
        });
    }

    protected completeSchedule(id: number, completed: boolean): void {
        this.api.completeTaskSchedule(id, completed).subscribe({
            next: () => {
                this.refreshHome();
            },
            error: () => {
                this.scheduleErrors.global = this.getGenericErrorMessage('schedule', 'complete');
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
        this.updateSchedule(id, (taskId, startTime, endTime, priority) => this.api.updateTaskSchedule(id, {taskId, taskDate: this.scheduleDate, startTime, endTime, priority}));
    }

    protected updateScheduleFollowing(id: number): void {
        this.updateSchedule(id, (taskId, startTime, endTime, priority) => this.api.updateFollowing(id, {taskId, taskDate: this.scheduleDate, startTime, endTime, priority}));
    }

    private validateScheduleRequest(): boolean {
        const taskId = this.selectedTaskId;
        const taskDate = this.scheduleDate;
        const startTime = this.scheduleStartTime || null;
        const endTime = this.scheduleEndTime || null;

        let isValid = true;

        this.resetScheduleErrors();

        if (!taskId) {
            this.scheduleErrors.taskId = this.getValidationMessage('scheduleTaskRequired');
            isValid = false;
        }

        if (!taskDate && !this.repeatSchedule) {
            this.scheduleErrors.date = this.getValidationMessage('scheduleDateRequired');
            isValid = false;
        }

        if (this.repeatSchedule && !this.startDate) {
            this.scheduleErrors.startDate = this.getValidationMessage('scheduleStartDateRequired');
            isValid = false;
        }

        if (this.repeatSchedule && !this.endDate) {
            this.scheduleErrors.endDate = this.getValidationMessage('scheduleEndDateRequired');
            isValid = false;
        }

        if (this.repeatSchedule && !this.daysChosen.length) {
            this.scheduleErrors.daysChosen = this.getValidationMessage('scheduleDaysRequired');
            isValid = false;
        }

        if (this.repeatSchedule && this.startDate && this.endDate && this.endDate < this.startDate) {
            this.scheduleErrors.endDate = this.getValidationMessage('scheduleEndAfterStart');
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

    private deleteSchedule(id: number, request$: Observable<void>): void {
        if (id !== 0) {
            this.resetScheduleActionErrors();

            request$.subscribe({
                next: () => {
                    this.refreshHome();
                    this.setScheduleActionModalState('delete', false);
                    this.setSuccessMessage(this.getSuccessMessage('schedule', 'delete'));
                },
                error: () => {
                    this.deleteErrors.global = this.getGenericErrorMessage('schedule', 'delete');
                }
            })
        }
        else {
            this.deleteErrors.global = this.getGenericErrorMessage('schedule', 'delete');
        }
    }

    private updateSchedule(id: number, requestFactory: (taskId: number, startTime: string | null, endTime: string | null, priority: Priority | null) => Observable<unknown>): void {
        const taskId = this.selectedTaskId;
        const startTime = this.scheduleStartTime || null;
        const endTime = this.scheduleEndTime || null;
        const priority = this.schedulePriority || null;

        this.resetScheduleActionErrors();

        if (!id || !taskId) {
            this.updateErrors.global = this.getGenericErrorMessage('schedule', 'update');
            return;
        }

        requestFactory(taskId, startTime, endTime, priority).subscribe({
            next: () => {
                this.refreshHome();
                this.setScheduleActionModalState('update', false);
                this.setScheduleModalState(false);
                this.setSuccessMessage(this.getSuccessMessage('schedule', 'update'));
            },
            error: () => {
                this.updateErrors.global = this.getGenericErrorMessage('schedule', 'update');
            }
        });
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

    //Warning / modales d'action
    protected toggleWarning(type:'category' | 'goal' | 'task', isOpen: boolean, id: number | null, title: string) {
        if(!isOpen) {
            this.resetWarningState();
            return;
        }

        this.resetWarningState();

        this.warningType = type;
        this.isWarningOpen = isOpen;
        this.warningId = id;
        this.warningTitle = title;

        if(type === 'category') {
            this.resetCategoryErrors();
        }
        else if(type === 'task') {
            this.resetTaskErrors();
        }
        else {
            this.resetGoalErrors();
        }

        this.setWarningMessage(type, title);
    }

    protected confirmWarningDelete(type: Warning, id: number) {
        if(type === 'category') {
            this.deleteGlobal(type, this.api.deleteCategory(id), id, this.getSuccessMessage('category', 'delete'), this.getBusinessDeleteErrorMessage('category'), this.getGenericErrorMessage('category', 'delete'));
        }
        else if(type === 'task') {
            this.deleteGlobal(type, this.api.deleteTask(id), id, this.getSuccessMessage('task', 'delete'), this.getBusinessDeleteErrorMessage('task'), this.getGenericErrorMessage('task', 'delete'));
        }
        else {
            this.deleteGlobal(type, this.api.deleteGoal(id), id, this.getSuccessMessage('goal', 'delete'), this.getBusinessDeleteErrorMessage('goal'), this.getGenericErrorMessage('goal', 'delete'));
        }
    }

    protected confirmWarningArchive(type: Warning, id: number) {
        if(type === 'category') {
            this.archiveGlobal(this.api.archiveCategory(id), this.getSuccessMessage('category', 'archive'), this.getGenericErrorMessage('category', 'archive'));
        }
        else if(type === 'task') {
            this.archiveGlobal(this.api.archiveTask(id), this.getSuccessMessage('task', 'archive'), this.getGenericErrorMessage('task', 'archive'));
        }
        else {
            this.archiveGlobal(this.api.archiveGoal(id), this.getSuccessMessage('goal', 'archive'), this.getGenericErrorMessage('goal', 'archive'));
        }
    }

    private errorWarning(errorCode: string, specificMessage: string, globalMessage: string): void {
        if (errorCode === "TASK_USED" || errorCode === "GOAL_USED" || errorCode === "CATEGORY_USED") {
            this.warningError = specificMessage;
            this.canSuggestArchive = true;
            this.warningMessage = `La suppression est impossible. Vous pouvez archiver cet élément pour le masquer du dashboard.`;
        }
        else {
            this.warningError = globalMessage;
            this.canSuggestArchive = false;
        }
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

    private deleteGlobal(type: Warning, request$: Observable<unknown>, id: number, successMessage: string, specificErrorMessage: string, globalErrorMessage: string): void {
        this.warningError = '';

        request$.subscribe({
            next: () => {
                if(type === 'category') {
                    this.categories = this.categories.filter(c => c.id !== id);
                }
                else if(type === 'task') {
                    this.tasks = this.tasks.filter(t => t.id !== id);
                }
                else {
                    this.goals = this.goals.filter(g => g.id !== id);
                }

                this.resetWarningState();
                this.setSuccessMessage(successMessage);
            },
            error: (error) => {
                const backendCode = error?.error?.code ?? '';

                this.errorWarning(backendCode, specificErrorMessage, globalErrorMessage);
            }
        })
    }

    private archiveGlobal(request$: Observable<unknown>, successMessage: string, globalErrorMessage: string): void {
        this.warningError = '';

        request$.subscribe({
            next: () => {
                this.refreshHome();
                this.resetWarningState();
                this.setSuccessMessage(successMessage);
            },
            error: (error) => {
                const backendMessage = error?.error?.message ?? '';

                this.canSuggestArchive = false;

                if(backendMessage !== '') {
                    this.warningError = backendMessage;
                }
                else {
                    this.warningError = globalErrorMessage;
                }
            }
        })
    }

    // display/date helpers
    private getCategoryIdByGoal(goalId: number | null) : number | null {
        const goal = this.goals.find(g => g.id === goalId);
        return goal ? goal.categoryId : null;
    }

    protected getScheduleDisplay(schedule: TaskScheduleRequest): ScheduleDisplay {
        let timeLabel = '';

        if (schedule.startTime && schedule.endTime) {
            timeLabel = `(${this.formatTime(schedule.startTime)} - ${this.formatTime(schedule.endTime)})`;
        }
        else if (schedule.startTime) {
            timeLabel = `(${this.formatTime(schedule.startTime)})`;
        }

        return {
            taskTitle: this.getTaskTitle(schedule.taskId),
            timeLabel,
            priorityLabel: this.getPriorityName(schedule.priority!),
            categoryTitle: this.getCategoryTitleByTask(schedule.taskId)
        }
    }

    protected getGoalDisplay(goal: Goal): GoalDisplay {
        return {
            categoryTitle: this.getCategoryTitle(goal.categoryId)
        }
    }

    private getTaskTitle(taskId: number): string {
        const task = this.tasks.find(t => t.id === taskId);
        return task ? task.title : this.getFallbackMessage('unknownTask');
    }

    private getPriorityName(priority: Priority): string {
        if (priority === 'HIGH') {
            return 'Haute';
        }
        else if (priority === 'MEDIUM') {
            return 'Moyenne';
        }
        else {
            return 'Basse';
        }
    }

    private formatTime(time: string | null): string {
        return time ? time.slice(0, 5) : '';
    }

    private getCategoryTitleByTask(taskId: number): string {
        const task = this.tasks.find(t => t.id === taskId);
        
        if(task?.categoryId) {
            return this.getCategoryTitle(task.categoryId);
        }
        else if(task?.goalId) {
            return this.getCategoryTitle(this.getCategoryIdByGoal(task.goalId));
        }
        
        return '';
    }

    private getCategoryTitle(catId: number | null): string {
        const category = this.categories.find(c => c.id === catId);
        return category ? category.title : '';
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private getYesterdayDate(): Date {
        const yesterday = new Date();

        yesterday.setDate(yesterday.getDate() - 1);

        return yesterday;
    }

    private initializeDates(): void {
        this.todayDate = new Date();
        this.yesterdayDate = this.getYesterdayDate();
        this.todayDateString = this.formatDate(this.todayDate);
        this.yesterdayDateString = this.formatDate(this.yesterdayDate);
    }

    //Message helpers
    private getSuccessMessage(type: EntityType, action: EntityAction): string {
        const messages = {
            category: {
                create: 'Catégorie ajoutée avec succès',
                update: 'Catégorie modifiée avec succès',
                delete: 'Catégorie supprimée avec succès',
                complete: '',
                load: '',
                archive: 'Catégorie archivée avec succès'
            },
            goal: {
                create: 'Objectif ajouté avec succès',
                update: 'Objectif modifié avec succès',
                delete: 'Objectif supprimé avec succès',
                complete: '',
                load: '',
                archive: 'Objectif archivé avec succès'
            },
            task: {
                create: 'Tâche ajoutée avec succès',
                update: 'Tâche modifiée avec succès',
                delete: 'Tâche supprimée avec succès',
                complete: '',
                load: '',
                archive: 'Tâche archivée avec succès'
            },
            schedule: {
                create: 'Planning créé avec succès',
                update: 'Planning modifié avec succès',
                delete: 'Planning supprimé avec succès',
                complete: 'Erreur lors de la complétion du planning',
                load: 'Erreur lors du chargement des plannings',
                archive: ''
            }
        };

        return messages[type][action];
    }

    private getGenericErrorMessage(type: EntityType, action: EntityAction): string {
        const messages = {
            category: {
                create: 'Erreur lors de l’ajout de la catégorie',
                update: 'Erreur lors de la modification de la catégorie',
                delete: 'Erreur lors de la suppression de la catégorie',
                complete: '',
                load: '',
                archive: `Erreur lors de l'archivage de la catégorie`
            },
            goal: {
                create: 'Erreur lors de l’ajout de l’objectif',
                update: 'Erreur lors de la modification de l’objectif',
                delete: 'Erreur lors de la suppression de l’objectif',
                complete: '',
                load: '',
                archive: `Erreur lors de l'archivage de l'objectif`
            },
            task: {
                create: 'Erreur lors de l’ajout de la tâche',
                update: 'Erreur lors de la modification de la tâche',
                delete: 'Erreur lors de la suppression de la tâche',
                complete: '',
                load: '',
                archive: `Erreur lors de l'archivage de la tâche`
            },
            schedule: {
                create: 'Erreur lors de l’ajout du planning',
                update: 'Erreur lors de la modification du planning',
                delete: 'Erreur lors de la suppression du planning',
                complete: '',
                load: '',
                archive: ''
            }
        };

        return messages[type][action];
    }

    private getBusinessDeleteErrorMessage(type: Warning): string {
        const messages = {
            category: 'Impossible de supprimer cette catégorie car elle est liée à une tâche ou à un objectif.',
            goal: 'Impossible de supprimer cet objectif car il est lié à une ou plusieurs tâches.',
            task: 'Impossible de supprimer cette tâche car elle est liée à un ou plusieurs plannings.'
        };

        return messages[type];
    }

    private getValidationMessage(key: 'categoryTitleRequired' | 'goalCategoryRequired' | 'taskTitleRequired' | 'scheduleTaskRequired' | 'scheduleDateRequired' | 'scheduleStartDateRequired' | 'scheduleEndDateRequired' | 'scheduleDaysRequired' | 'scheduleEndAfterStart'): string {
        const messages = {
            categoryTitleRequired: 'Le nom de la catégorie est obligatoire',
            goalCategoryRequired: 'La catégorie est obligatoire',
            taskTitleRequired: 'Le titre ne peut pas être vide',
            scheduleTaskRequired: 'La tâche est obligatoire',
            scheduleDateRequired: 'La date est obligatoire',
            scheduleStartDateRequired: 'La date de début est obligatoire pour une répétition',
            scheduleEndDateRequired: 'La date de fin est obligatoire pour une répétition',
            scheduleDaysRequired: 'Au moins un jour doit être choisi pour une répétition',
            scheduleEndAfterStart: 'La date de fin doit être après la date de début'
        };

        return messages[key];
    }

    private getFallbackMessage(key: 'unknownTask' | 'dashboardLoadError'): string {
        const messages = {
            unknownTask: 'Tâche inconnue',
            dashboardLoadError: 'Erreur lors du chargement du dashboard'
        };

        return messages[key];
    }

    private setWarningMessage(type: Warning, title: string): void {
        if(type === "category") {
            this.warningMessage = `Voulez-vous vraiment supprimer la catégorie "${title}"?`;
        }
        else if(type === "task") {
            this.warningMessage = `Voulez-vous vraiment supprimer la tâche "${title}"?`;
        }
        else {
            this.warningMessage = `Voulez-vous vraiment supprimer l'objectif "${title}"?`;
        }
    }

    private setSuccessMessage(message: string): void {
        this.snack.open(message, '✖', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['custom-toast']
        });
    }

    //Reset helpers
    private resetCategoryErrors(): void {
        this.categoryErrors = {
            global: '',
            title: ''
        };
    }

    private resetCategoryForm(): void {
        this.newCategoryTitle = '';
    }

    private resetCategoryEditState(): void {
        this.modifyCategoryId = null;
        this.modifyCategoryTitle = '';
        this.categorySubmit = false;
    }

    private resetCategoryState(): void {
        this.resetCategoryErrors();
        this.resetCategoryForm();
        this.resetCategoryEditState();
    }

    private resetGoalErrors(): void {
        this.goalErrors = {
            global: '',
            title: '',
            category: ''
        };
    }

    private resetGoalForm(): void {
        this.goalTitle = '';
        this.goalCategoryId = null;
        this.modifyGoalId = null;
    }

    private resetGoalUiState(): void {
        this.goalSubmit = false;
        this.isGoalModalOn = false;
    }

    private resetGoalModal(): void {
        this.resetGoalErrors();
        this.resetGoalForm();
        this.resetGoalUiState();
    }

    private resetTaskErrors(): void {
        this.taskErrors = {
            global: '',
            title: ''
        };
    }

    private resetTaskForm(): void {
        this.taskTitle = '';
        this.taskDescription = '';
        this.selectedGoalId = null;
        this.selectedTaskCategoryId = null;
        this.modifyTaskId = null;
    }

    private resetTaskUiState(): void {
        this.taskSubmit = false;
        this.isTaskModalOpen = false;
    }

    private resetTaskModal(): void {
        this.resetTaskErrors();
        this.resetTaskForm();
        this.resetTaskUiState();
    }

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

    private resetWarningState(): void {
        this.isWarningOpen = false;
        this.warningType = null;
        this.warningId = null;
        this.warningTitle = '';
        this.warningMessage = '';
        this.warningError = '';
        this.canSuggestArchive = false;
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

    //Validations
    protected hasAnyErrors(errors: Record<string, string>): boolean {
        return Object.values(errors).some(e => e !== '');
    }

    protected canToggleScheduleCompletion(schedule: TaskSchedule): boolean {
        return schedule.taskDate === this.todayDateString || schedule.taskDate === this.yesterdayDateString;
    }

    protected canEditOrDeleteSchedule(schedule: TaskSchedule): boolean {
        return schedule.taskDate >= this.todayDateString && !schedule.completed;
    }
}