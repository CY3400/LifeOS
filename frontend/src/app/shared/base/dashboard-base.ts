import { ScheduleBase } from "./schedule-base";
import { Category, Goal, Priority, Task, TaskSchedule } from "../../services/api";
import { ScheduleDisplay } from "../types/schedule-display";
import { getCategoryTitleByTask, getTaskTitle } from "../utils/task-utils";
import { formatScheduleTimeLabel, getPriorityName } from "../utils/schedule-utils";

export abstract class DashboardBase extends ScheduleBase {
    goals: Goal[] = [];
    tasks: Task[] = [];
    categories: Category[] = [];
    totalTasks: number = 0;
    completedTasks: number = 0;
    remainingTasks: number = 0;
    completionRate: number = 0;

    protected loadDashboard(onSuccess: () => void, onError: () => void): void {
        this.api.today().subscribe({
            next: (dashboard) => {
                this.goals = dashboard.goals;
                this.tasks = dashboard.tasks;
                this.categories = dashboard.categories;
                this.totalTasks = dashboard.totalTasks;
                this.completedTasks = dashboard.completedTasks;
                this.remainingTasks = dashboard.totalTasks - dashboard.completedTasks;
                this.completionRate = dashboard.completionRate;

                onSuccess();
            },
            error: () => {
                onError();
            }
        });
    }

    protected getScheduleTaskDescription(taskId: number): string {
        return '';
    }

    protected getSchedulePriorityClass(priority: Priority | null): string {
        return '';
    }

    protected getScheduleDisplay(schedule: TaskSchedule | null): ScheduleDisplay | null {
        if (!schedule) {
            return null;
        }

        return {
            taskTitle: getTaskTitle(schedule.taskId, this.tasks),
            timeLabel: formatScheduleTimeLabel(schedule.startTime, schedule.endTime),
            priorityLabel: getPriorityName(schedule.priority),
            priorityClass: this.getSchedulePriorityClass(schedule.priority),
            categoryTitle: getCategoryTitleByTask(schedule.taskId, this.tasks, this.categories, this.goals),
            taskDescription: this.getScheduleTaskDescription(schedule.taskId)
        }
    }
}