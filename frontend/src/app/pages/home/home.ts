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

    errors = {
        title: '',
        global: ''
    };

    scheduleErrors = {
        taskId: '',
        date: '',
        endTime: '',
        global: ''
    };

    constructor(private api: Api) {}

    ngOnInit() {
        this.loadDashboard();
        this.loadTodaySchedules();
    }

    hasErrors(): boolean {
        return Object.values(this.errors).some(e => e !== '');
    }

    hasScheduleErrors(): boolean {
        return Object.values(this.scheduleErrors).some(e => e !== '');
    }

    todayString(): string {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    getTaskTitle(taskId: number): string {
        const task = this.tasks.find(t => t.id === taskId);
        return task ? task.title : 'Tâche inconnue';
    }

    formatTime(time: string | null): string {
        return time ? time.slice(0, 5) : '';
    }

    openModal(isModalOpen: boolean): void {
        this.isTaskModalOpen = isModalOpen;
        this.errors.global = '';
        this.errors.title = '';
        this.taskTitle = '';
        this.selectedGoalId = null;
        this.modifyTaskId = null;
    }

    openScheduleModal(isOpen: boolean): void {
        this.isScheduleModalOpen = isOpen;
        this.scheduleErrors.taskId = '';
        this.scheduleErrors.date = '';
        this.scheduleErrors.endTime = '';
        this.scheduleErrors.global = '';
        this.selectedTaskId = null;
        this.scheduleDate = this.todayString();
        this.scheduleStartTime = '';
        this.scheduleEndTime = '';
        this.modifyScheduleId = null;
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
            this.api.modifyGoal(id, title)
                .pipe(finalize(() => {
                    this.modifyGoalId = null;
                    this.modifyGoalTitle = '';
                }))
                .subscribe({
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
            this.api.addGoal(title)
                .pipe(finalize(() => { this.goalSubmit = false; }))
                .subscribe({
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
                this.loadDashboard();
            },
            error: () => {
                console.error("Error lors de la suppression de la tâche");
            }
        });
    }

    submitTask(): void {
        const title = this.taskTitle.trim();
        const goalId = this.selectedGoalId !== '' && this.selectedGoalId ? parseInt(this.selectedGoalId, 10) : null;

        this.errors.title = '';
        this.errors.global = '';

        if (title === '') {
            this.errors.title = "Le titre ne peut pas être vide";
            return;
        }

        this.taskSubmit = true;

        if (this.modifyTaskId) {
            this.api.updateTask(this.modifyTaskId, title, goalId)
                .pipe(finalize(() => {
                    this.taskSubmit = false;
                    this.modifyTaskId = null;
                }))
                .subscribe({
                    next: () => {
                        this.loadDashboard();
                        this.taskTitle = '';
                        this.selectedGoalId = null;
                        this.isTaskModalOpen = false;
                    },
                    error: () => {
                        console.error("Error lors de la modification de la tâche");
                        this.errors.global = "Une erreur s'est produite lors de la modification de la tâche.";
                    }
                });
        } else {
            this.api.createTask(title, goalId)
                .pipe(finalize(() => { this.taskSubmit = false; }))
                .subscribe({
                    next: () => {
                        this.loadDashboard();
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
        this.scheduleErrors.taskId = '';
        this.scheduleErrors.date = '';
        this.scheduleErrors.endTime = '';
        this.scheduleErrors.global = '';
    }

    submitSchedule(): void {
        const taskId = this.selectedTaskId ? parseInt(this.selectedTaskId, 10) : null;
        const taskDate = this.scheduleDate;
        const startTime = this.scheduleStartTime || null;
        const endTime = this.scheduleEndTime || null;

        let isValid = true;

        this.scheduleErrors.taskId = '';
        this.scheduleErrors.date = '';
        this.scheduleErrors.endTime = '';
        this.scheduleErrors.global = '';

        if (!taskId) {
            this.scheduleErrors.taskId = "La tâche est obligatoire";
            isValid = false;
        }

        if (!taskDate) {
            this.scheduleErrors.date = "La date est obligatoire";
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

        if (this.modifyScheduleId) {
            this.api.updateTaskSchedule(this.modifyScheduleId, taskId!, taskDate, startTime, endTime)
                .pipe(finalize(() => {
                    this.scheduleSubmit = false;
                    this.modifyScheduleId = null;
                }))
                .subscribe({
                    next: () => {
                        this.loadDashboard();
                        this.loadTodaySchedules();
                        this.isScheduleModalOpen = false;
                    },
                    error: () => {
                        this.scheduleErrors.global = "Une erreur s'est produite lors de la modification du planning.";
                    }
                });
        } else {
            this.api.createTaskSchedule(taskId!, taskDate, startTime, endTime)
                .pipe(finalize(() => { this.scheduleSubmit = false; }))
                .subscribe({
                    next: () => {
                        this.loadDashboard();
                        this.loadTodaySchedules();
                        this.isScheduleModalOpen = false;
                    },
                    error: () => {
                        this.scheduleErrors.global = "Une erreur s'est produite lors de la création du planning.";
                    }
                });
        }
    }

    deleteSchedule(id: number): void {
        this.api.deleteTaskSchedule(id).subscribe({
            next: () => {
                this.loadDashboard();
                this.loadTodaySchedules();
            },
            error: () => {
                console.error("Error lors de la suppression du planning");
            }
        });
    }

    completeSchedule(id: number, completed: boolean): void {
        this.api.completeTaskSchedule(id, completed).subscribe({
            next: () => {
                this.loadDashboard();
                this.loadTodaySchedules();
            },
            error: () => {
                console.error("Error lors de la complétion du planning");
            }
        });
    }
}