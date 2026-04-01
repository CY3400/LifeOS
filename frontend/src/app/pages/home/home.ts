import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Api, DailyTask, Goal } from "../../services/api";

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
}