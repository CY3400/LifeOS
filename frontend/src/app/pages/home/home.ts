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

    constructor(private api: Api) {}

    ngOnInit() {
        this.loadDashboard();
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
}