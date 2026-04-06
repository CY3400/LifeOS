import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Api, DailyTask, Goal } from "../../services/api";
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
    dailyTasks: DailyTask[] = [];
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
    taskDate: string = '';
    taskStartTime: string = '';
    taskEndTime: string = '';
    selectedGoalId: string | null = null;
    modifyTaskId: number | null = null;

    errors = {
        title: '',
        date: '',
        endDate: '',
        global: ''
    }

    constructor(private api: Api) {}

    ngOnInit() {
        this.loadDashboard();
    }

    hasErrors(): boolean {
        return Object.values(this.errors).some(e => e !== '');
    }

    formatTime(time: string | null): string {
        return time ? time.slice(0, 5) : '';
    }

    openModal(isModalOpen: boolean): void {
        this.isTaskModalOpen = isModalOpen;
        this.errors.date = '';
        this.errors.endDate = '';
        this.errors.global = '';
        this.errors.title = '';
        this.taskTitle = '';
        this.taskDate = '';
        this.taskStartTime = '';
        this.taskEndTime = '';
        this.selectedGoalId = null;
        this.modifyTaskId = null;
    }

    loadDashboard(){
        this.api.today().subscribe({
            next: (dashboard) => {
                this.goals = dashboard.goals;
                this.dailyTasks = dashboard.dailyTasks;
                this.totalTasks = dashboard.totalTasks;
                this.completedTasks = dashboard.completedTasks;
                this.completionRate = dashboard.completionRate;
            },
            error: () => {
                console.error("Error lors du chargement du dashboard");
            }
        })
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
        })
    }

    onSubmit(): void {
        const title = this.newGoalTitle.trim();

        if (title) {
            this.goalSubmit = true;
            this.api.addGoal(title).pipe(finalize(() => {this.goalSubmit = false;})).subscribe({
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
        const taskDate = this.taskDate;
        const startTime = this.taskStartTime || null;
        const endTime = this.taskEndTime || null;
        const goalId = this.selectedGoalId !== '' && this.selectedGoalId ? parseInt(this.selectedGoalId) : null;

        let isValid = true;

        this.errors.title = ''
        this.errors.date = ''
        this.errors.endDate = ''
        this.errors.global = ''

        if(title == '') {
            this.errors.title = "Le titre ne peut pas être vide";
            isValid = false;
        }
        if(taskDate == '') {
            this.errors.date = "La date est requise";
            isValid = false;
        }
        if(endTime && startTime && endTime <= startTime) {
            this.errors.endDate = "L'heure de fin doit être après l'heure de début";
            isValid = false;
        }
        if(endTime && !startTime) {
            this.errors.endDate = "L'heure de début est requise si une heure de fin est fournie";
            isValid = false;
        }

        if(!isValid) return;

        this.taskSubmit = true;

        if(this.modifyTaskId) {
            this.api.updateTask(this.modifyTaskId, title, taskDate, startTime, endTime, goalId).pipe(finalize(() => {this.taskSubmit = false; this.modifyTaskId = null;})).subscribe({
                next: () => {
                    this.loadDashboard();
                    this.taskTitle = '';
                    this.taskDate = '';
                    this.taskStartTime = '';
                    this.taskEndTime = '';
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
            this.api.createTask(title, taskDate, startTime, endTime, goalId).pipe(finalize(() => {this.taskSubmit = false})).subscribe({
                next: () => {
                    this.loadDashboard();
                    this.taskTitle = '';
                    this.taskDate = '';
                    this.taskStartTime = '';
                    this.taskEndTime = '';
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

    completeTask(id: number, completed: boolean): void {
        this.api.completeTask(id, completed).subscribe({
            next: () => {
                this.loadDashboard();
            },
            error: () => {
                console.error("Error lors de la complétion de la tâche");
            }
        })
    }

    setModifyTask(id: number, title: string, startTime: string | null, endTime: string | null, goalId: number | null, taskDate: string): void {
        this.isTaskModalOpen = true;
        this.taskTitle = title;
        this.taskStartTime = startTime || '';
        this.taskEndTime = endTime || '';
        this.selectedGoalId = goalId?.toString() || null;
        this.taskDate = taskDate;
        this.modifyTaskId = id;
    }
}