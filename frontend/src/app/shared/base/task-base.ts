import { finalize, Observable } from "rxjs";
import { getGenericErrorMessage, getSuccessMessage, getValidationMessage } from "../utils/messages-utils";
import { GoalBase } from "./goal-base";
import { Task } from "../../services/api";
import { getCategoryIdByGoal } from "../utils/task-utils";

export abstract class TaskBase extends GoalBase {
    isTaskModalOpen: boolean = false;
    taskTitle: string = '';
    taskDescription: string = '';
    taskSubmit: boolean = false;
    selectedGoalId: number | null = null;
    modifyTaskId: number | null = null;
    selectedTaskCategoryId: number | null = null;
    taskSearch: string = '';
    taskCategorySearch: number | null = null;
    taskGoalSearch: number | null = null;
    taskErrors = {
        title: '',
        global: ''
    };

    protected resetTaskErrors(): void {
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

    protected setTaskModalState(isOpen: boolean): void {
        if (isOpen) {
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
        this.selectedGoalId = goalId ?? null;
        this.selectedTaskCategoryId = categoryId ?? null;
        this.modifyTaskId = id;
    }

    private performTaskSave(request$: Observable<Task>, errorMessage: string, successMessage: string): void {
        request$.pipe(
            finalize(() => {
                this.taskSubmit = false;
            })
        ).subscribe({
            next: () => {
                this.refreshAfterDataChange();
                this.setTaskModalState(false);
                this.setSuccessMessage(successMessage);
            },
            error: () => {
                this.taskErrors.global = errorMessage;
            }
        });
    }

    protected saveTask(): void {
        const title = this.taskTitle.trim();

        this.resetTaskErrors();

        if (title === '') {
            this.taskErrors.title = getValidationMessage('taskTitleRequired');
            return;
        }

        this.taskSubmit = true;

        if (this.modifyTaskId !== null) {
            this.performTaskSave(this.api.updateTask(this.modifyTaskId, title, this.taskDescription, this.selectedGoalId, this.selectedTaskCategoryId), getGenericErrorMessage('task', 'update'), getSuccessMessage('task', 'update'));
        } 
        else {
            this.performTaskSave(this.api.createTask(title, this.taskDescription, this.selectedGoalId, this.selectedTaskCategoryId), getGenericErrorMessage('task', 'create'), getSuccessMessage('task', 'create'));
        }
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

    protected filteredTasks(): Task[] {
        const search = this.taskSearch.trim().toLocaleLowerCase();
        const selectedCategoryId = this.taskCategorySearch;
        const selectedGoalId = this.taskGoalSearch;

        return this.tasks.filter(task => {
            const taskCategoryId = task.categoryId ?? getCategoryIdByGoal(task.goalId, this.goals);

            const activeTasks = task.status === 'ACTIVE';
            const titleMatches = task.title.toLocaleLowerCase().includes(search);
            const descriptionMatches = task.description?.toLocaleLowerCase().includes(search) ?? false;
            const matchesSearch = !search || titleMatches || descriptionMatches;
            const matchesCategory = selectedCategoryId === null || taskCategoryId === selectedCategoryId;
            const matchesGoal = selectedGoalId === null || task.goalId === selectedGoalId;

            return activeTasks && matchesSearch && matchesCategory && matchesGoal;
        });
    }
}