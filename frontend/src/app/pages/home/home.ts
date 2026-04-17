import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Api, Task, Goal, TaskSchedule } from "../../services/api";
import { finalize } from "rxjs";
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
    selectedTaskId: string | null = null;
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

    errors = {
        title: '',
        global: ''
    };

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

    refreshHome() {
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
                console.error("Error lors du chargement du dashboard");
            }
        });
    }

    private updateVisibleRange(): void {
        const current = new Date(this.viewDate);
        const year = current.getFullYear();
        const month = current.getMonth();

        if (this.view === CalendarView.Month) {
            this.startDateBetween = new Date(year, month, 1);
            this.endDateBetween = new Date(year, month + 1, 0);
            return;
        }

        if (this.view === CalendarView.Week) {
            const current = new Date(this.viewDate);
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
        this.errors.title = '';
        this.errors.global = '';
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

    private resetDeleteErrors(): void {
        this.deleteErrors.global = '';
    }

    private resetUpdateErrors(): void {
        this.updateErrors.global = '';
    }

    hasErrors(): boolean {
        return Object.values(this.errors).some(e => e !== '');
    }

    hasScheduleErrors(): boolean {
        return Object.values(this.scheduleErrors).some(e => e !== '');
    }

    hasDeleteErrors(): boolean {
        return Object.values(this.deleteErrors).some(e => e !== '');
    }

    hasUpdateErrors(): boolean {
        return Object.values(this.updateErrors).some(e => e !== '');
    }

    todayString(): string {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    switchRepeatSchedule() {
        this.repeatSchedule = !this.repeatSchedule;
        if (!this.repeatSchedule) {
            this.startDate = '';
            this.endDate = '';
            this.daysChosen = [];
        }
    }

    getTaskTitle(taskId: number): string {
        const task = this.tasks.find(t => t.id === taskId);
        return task ? task.title : 'Tâche inconnue';
    }

    formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatTime(time: string | null): string {
        return time ? time.slice(0, 5) : '';
    }

    toggleDay(day: number): void {
        if (this.daysChosen.includes(day)) {
            this.daysChosen = this.daysChosen.filter(d => d !== day);
        }
        else {
            this.daysChosen = [...this.daysChosen, day];
        }
    }

    openModal(isModalOpen: boolean): void {
        this.isTaskModalOpen = isModalOpen;
        this.resetTaskErrors();
        this.taskTitle = '';
        this.selectedGoalId = null;
        this.modifyTaskId = null;
    }

    openUpdateModal(isUpdateModalOpen: boolean, scheduleId: number): void {
        this.isUpdateModalOpen = isUpdateModalOpen;
        this.resetUpdateErrors();
        if(!isUpdateModalOpen) {
            this.selectedScheduleId = 0;
        }
        else {
            this.selectedScheduleId = scheduleId;
        }
    }

    openDeleteModal(isDeleteModalOpen: boolean, scheduleId: number): void {
        this.isDeleteModalOpen = isDeleteModalOpen;
        this.resetDeleteErrors();
        if(!isDeleteModalOpen) {
            this.selectedScheduleId = 0;
        }
        else {
            this.selectedScheduleId = scheduleId;
        }
    }

    openScheduleModal(isOpen: boolean): void {
        this.isScheduleModalOpen = isOpen;
        this.resetScheduleErrors();
        this.selectedTaskId = null;
        this.scheduleDate = this.todayString();
        this.scheduleStartTime = '';
        this.scheduleEndTime = '';
        this.modifyScheduleId = null;
        this.repeatSchedule = false;
        this.startDate = '';
        this.endDate = '';
        this.daysChosen = [];
    }

    setModifyInput(id: number | null, title: string | null): void {
        this.modifyGoalId = id;
        this.modifyGoalTitle = title || '';
    }

    modifyGoal(id: number): void {
        const title = this.modifyGoalTitle.trim();

        if (title) {
            this.api.modifyGoal(id, title).pipe(finalize(() => {this.modifyGoalId = null; this.modifyGoalTitle = '';})).subscribe({
                next: (goal) => {
                    const index = this.goals.findIndex(g => g.id === id);
                    if (index !== -1) {
                        this.goals[index] = goal;
                    }
                },
                error: () => {
                    console.error("Error lors de la modification de l'objectif");
                }
            });
        }
    }

    deleteGoal(id: number): void {
        this.api.deleteGoal(id).subscribe({
            next: () => {
                this.goals = this.goals.filter(g => g.id !== id);
            },
            error: () => {
                console.error("Error lors de la suppression de l'objectif");
            }
        });
    }

    onSubmit(): void {
        const title = this.newGoalTitle.trim();

        if (title) {
            this.goalSubmit = true;
            this.api.addGoal(title).pipe(finalize(() => { this.goalSubmit = false; })).subscribe({
                next: (goal) => {
                    this.goals.push(goal);
                    this.newGoalTitle = '';
                },
                error: () => {
                    console.error("Error lors de l'ajout de l'objectif");
                }
            });
        }
    }

    deleteTask(id: number): void {
        this.api.deleteTask(id).subscribe({
            next: () => {
                this.refreshHome();
            },
            error: () => {
                console.error("Error lors de la suppression de la tâche");
            }
        });
    }

    submitTask(): void {
        const title = this.taskTitle.trim();
        const goalId = this.selectedGoalId !== '' && this.selectedGoalId ? parseInt(this.selectedGoalId, 10) : null;

        this.resetTaskErrors();

        if (title === '') {
            this.errors.title = "Le titre ne peut pas être vide";
            return;
        }

        this.taskSubmit = true;

        if (this.modifyTaskId != null) {
            this.api.updateTask(this.modifyTaskId, title, goalId).pipe(finalize(() => {this.taskSubmit = false; this.modifyTaskId = null;})).subscribe({
                next: () => {
                    this.refreshHome();
                    this.taskTitle = '';
                    this.selectedGoalId = null;
                    this.isTaskModalOpen = false;
                },
                error: () => {
                    console.error("Error lors de la modification de la tâche");
                    this.errors.global = "Une erreur s'est produite lors de la modification de la tâche.";
                }
            });
        } 
        else {
            this.api.createTask(title, goalId).pipe(finalize(() => { this.taskSubmit = false; })).subscribe({
                next: () => {
                    this.refreshHome();
                    this.taskTitle = '';
                    this.selectedGoalId = null;
                    this.isTaskModalOpen = false;
                },
                error: () => {
                    console.error("Error lors de la création de la tâche");
                    this.errors.global = "Une erreur s'est produite lors de la création de la tâche.";
                }
            });
        }
    }

    setModifyTask(id: number, title: string, goalId: number | null): void {
        this.isTaskModalOpen = true;
        this.taskTitle = title;
        this.selectedGoalId = goalId?.toString() || null;
        this.modifyTaskId = id;
    }

    setModifySchedule(schedule: TaskSchedule): void {
        this.isScheduleModalOpen = true;
        this.modifyScheduleId = schedule.id;
        this.selectedTaskId = schedule.taskId.toString();
        this.scheduleDate = schedule.taskDate;
        this.scheduleStartTime = schedule.startTime || '';
        this.scheduleEndTime = schedule.endTime || '';
        this.repeatSchedule = false;
        this.startDate = '';
        this.endDate = '';
        this.daysChosen = [];
        this.resetScheduleErrors();
    }

    submitSchedule(): void {
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

        if (!isValid) return;

        this.scheduleSubmit = true;

        if (this.modifyScheduleId != null) {
            this.isScheduleModalOpen = false;
            this.scheduleSubmit = false;
            this.openUpdateModal(true, this.modifyScheduleId);
            return;
        }
        else if (!this.repeatSchedule) {
            this.api.createTaskSchedule(taskId!, taskDate, startTime, endTime).pipe(finalize(() => { this.scheduleSubmit = false; })).subscribe({
                next: () => {
                    this.refreshHome();
                    this.isScheduleModalOpen = false;
                },
                error: () => {
                    this.scheduleErrors.global = "Une erreur s'est produite lors de la création du planning.";
                }
            });
        }
        else {
            const startDate = this.startDate;
            const endDate = this.endDate;
            const daysChosen = this.daysChosen;
            this.api.repeatTaskSchedules(taskId!, startDate, endDate, startTime, endTime, daysChosen).pipe(finalize(() => { this.scheduleSubmit = false; this.repeatSchedule = false; })).subscribe({
                next: () => {
                    this.refreshHome();
                    this.isScheduleModalOpen = false;
                },
                error: () => {
                     this.scheduleErrors.global = "Une erreur s'est produite lors de la création des plannings répétés.";
                }
            })
        }
    }

    updateSchedule(id: number): void {
        const taskId = this.selectedTaskId ? parseInt(this.selectedTaskId, 10) : null;
        const taskDate = this.scheduleDate;
        const startTime = this.scheduleStartTime || null;
        const endTime = this.scheduleEndTime || null;

        this.resetUpdateErrors();

        if (!id || !taskId) {
            this.updateErrors.global = "Une erreur s'est produite lors de la modification du planning.";
            return;
        }

        this.api.updateTaskSchedule(id, taskId, taskDate, startTime, endTime).subscribe({
            next: () => {
                this.refreshHome();
                this.isUpdateModalOpen = false;
                this.selectedScheduleId = 0;
                this.modifyScheduleId = null;
            },
            error: () => {
                console.error("Une erreur s'est produite lors de la modification du planning.");
                this.updateErrors.global = "Une erreur s'est produite lors de la modification du planning.";
            }
        });
    }

    deleteSchedule(id: number): void {
        if(id != 0) {
            this.resetDeleteErrors();

            this.api.deleteTaskSchedule(id).subscribe({
                next: () => {
                    this.refreshHome();
                    this.isDeleteModalOpen = false;
                    this.selectedScheduleId = 0;
                },
                error: () => {
                    console.error("Une erreur s'est produite lors de la suppression du planning.");
                    this.deleteErrors.global = "Une erreur s'est produite lors de la suppression du planning.";
                }
            });
        }
        else {
            this.deleteErrors.global = "Une erreur s'est produite lors de la suppression du planning.";
        }
    }

    deleteScheduleFollowing(id: number): void {
        if(id != 0) {
            this.resetDeleteErrors();

            this.api.deleteFollowing(id).subscribe({
                next: () => {
                    this.refreshHome();
                    this.isDeleteModalOpen = false;
                    this.selectedScheduleId = 0;
                },
                error: () => {
                    console.error("Une erreur s'est produite lors de la suppression du planning.");
                    this.deleteErrors.global = "Une erreur s'est produite lors de la suppression du planning.";
                }
            });
        }
        else {
            this.deleteErrors.global = "Une erreur s'est produite lors de la suppression du planning.";
        }
    }

    updateScheduleFollowing(id: number): void {
        const taskId = this.selectedTaskId ? parseInt(this.selectedTaskId, 10) : null;
        const taskDate = this.scheduleDate;
        const startTime = this.scheduleStartTime || null;
        const endTime = this.scheduleEndTime || null;

        this.resetUpdateErrors();

        if (!id || !taskId) {
            this.updateErrors.global = "Une erreur s'est produite lors de la modification du planning.";
            return;
        }

        this.api.updateFollowing(id, taskId, taskDate, startTime, endTime).subscribe({
            next: () => {
                this.refreshHome();
                this.isUpdateModalOpen = false;
                this.selectedScheduleId = 0;
                this.modifyScheduleId = null;
            },
            error: () => {
                console.error("Une erreur s'est produite lors de la modification du planning.");
                this.updateErrors.global = "Une erreur s'est produite lors de la modification du planning.";
            }
        });
    }

    completeSchedule(id: number, completed: boolean): void {
        this.api.completeTaskSchedule(id, completed).subscribe({
            next: () => {
                this.refreshHome();
            },
            error: () => {
                console.error("Error lors de la complétion du planning");
            }
        });
    }

    setView(view: CalendarView): void{
        this.view = view;
        this.updateVisibleRange();
        this.loadSchedulesBetweenDates(this.startDateBetween, this.endDateBetween);
    }

    loadSchedulesByDate(date: Date): void {
        const formattedDate = this.formatDate(date);

        this.api.getTaskSchedulesByDate(formattedDate).subscribe({
            next: (schedules) => {
                this.selectedDateSchedules = schedules;
            },
            error: () => {
                console.error("Erreur lors du chargement des plannings pour la date sélectionnée");
            }
        });
    }

    loadSchedulesBetweenDates(startDate: Date, endDate: Date): void {
        const formattedStartDate = this.formatDate(startDate);
        const formattedEndDate = this.formatDate(endDate);

        this.api.getTaskSchedulesBetweenDates(formattedStartDate, formattedEndDate).subscribe({
            next: (schedules) => {
                this.calendarEvents = schedules.map((schedule): CalendarEvent => {
                    const title = this.getTaskTitle(schedule.taskId);

                    if (schedule.startTime) {
                        const start = new Date(`${schedule.taskDate}T${schedule.startTime}`);
                        const end = schedule.endTime ? new Date(`${schedule.taskDate}T${schedule.endTime}`) : start;

                        return { id: schedule.id, start, end, cssClass: schedule.completed ? 'completed-event' : '', title, color: schedule.completed ? { primary: '#64748B', secondary: '#CBD5E1'} : { primary: '#3B82F6', secondary: '#BFDBFE'}, meta: schedule };
                    }

                    return { id: schedule.id,  start: new Date(`${schedule.taskDate}T00:00:00`), cssClass: schedule.completed ? 'completed-event' : '', title, allDay: true, color: schedule.completed ? { primary: '#64748B', secondary: '#CBD5E1'} : { primary: '#3B82F6', secondary: '#BFDBFE'}, meta: schedule };
                });
            },
            error: () => {
                console.error("Erreur lors du chargement des plannings pour la date sélectionnée");
            }
        });
    }

    onDayClicked(date: Date): void {
        this.selectedDate = date;
        this.viewDate = date;
        this.loadSchedulesByDate(date);
    }

    goToPrevious(): void {
        if (this.view === CalendarView.Month) {
            this.viewDate = subMonths(this.viewDate, 1);
        }
        else if (this.view === CalendarView.Week) {
            this.viewDate = subWeeks(this.viewDate, 1);
        }
        else {
            this.viewDate = subDays(this.viewDate, 1);
            this.selectedDate = this.viewDate;
            this.loadSchedulesByDate(this.selectedDate);
        }

        this.updateVisibleRange();
        this.loadSchedulesBetweenDates(this.startDateBetween, this.endDateBetween);
    }

    goToNext(): void {
        if (this.view === CalendarView.Month) {
            this.viewDate = addMonths(this.viewDate, 1);
        }
        else if (this.view === CalendarView.Week) {
            this.viewDate = addWeeks(this.viewDate, 1);
        }
        else {
            this.viewDate = addDays(this.viewDate, 1);
            this.selectedDate = this.viewDate;
            this.loadSchedulesByDate(this.selectedDate);
        }

        this.updateVisibleRange();
        this.loadSchedulesBetweenDates(this.startDateBetween, this.endDateBetween);
    }

    goToToday(): void {
        const today = new Date();
        this.viewDate = today;
        this.selectedDate = today;

        this.loadSchedulesByDate(today);
        this.updateVisibleRange();
        this.loadSchedulesBetweenDates(this.startDateBetween, this.endDateBetween);
    }
}