import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Api, Task, Goal, TaskSchedule } from "../../services/api";
import { finalize } from "rxjs";

@Component({
    selector: 'app-home',
    templateUrl: './home.html',
    styleUrls: ['./home.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule]
})
export class Home implements OnInit {
    goals: Goal[] = [];
    tasks: Task[] = [];
    schedules: TaskSchedule[] = [];

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
        this.loadDashboard();
        this.loadTodaySchedules();
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

    loadDashboard() {
        this.api.today().subscribe({
            next: (dashboard) => {
                this.goals = dashboard.goals;
                this.tasks = dashboard.tasks;
                this.totalTasks = dashboard.totalTasks;
                this.completedTasks = dashboard.completedTasks;
                this.completionRate = dashboard.completionRate;
            },
            error: () => {
                console.error("Error lors du chargement du dashboard");
            }
        });
    }

    loadTodaySchedules() {
        this.api.getTaskSchedulesByDate(this.todayString()).subscribe({
            next: (schedules) => {
                this.schedules = schedules;
            },
            error: () => {
                console.error("Error lors du chargement des plannings");
            }
        });
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
}