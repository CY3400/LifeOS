import { Category, Goal, Task } from "../../services/api";

export function getTaskTitle(taskId: number, tasks: Task[]): string {
    const task = tasks.find(t => t.id === taskId);
    return task ? task.title : '';
}

export function getCategoryTitle(catId: number | null, categories: Category[]): string {
    const category = categories.find(c => c.id === catId);
    return category ? category.title : '';
}

export function getCategoryIdByGoal(goalId: number | null, goals: Goal[]): number | null {
    const goal = goals.find(g => g.id === goalId);
    return goal ? goal.categoryId : null;
}

export function getCategoryTitleByTask(taskId: number, tasks: Task[], categories: Category[], goals: Goal[]): string {
    const task = tasks.find(t => t.id === taskId);
    
    if (task?.categoryId != null) {
        return getCategoryTitle(task.categoryId, categories);
    }
    else if (task?.goalId != null) {
        return getCategoryTitle(getCategoryIdByGoal(task.goalId, goals), categories);
    }
    
    return '';
}