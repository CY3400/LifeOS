import { finalize } from "rxjs";
import { Goal, GoalProgress, Task } from "../../services/api";
import { GoalBase } from "./goal-base";

export abstract class GoalDetailsBase extends GoalBase {
  isGoalTasksModalOn: boolean = false;
  isGoalTasksLoading: boolean = false;
  goalDetailsError: string = '';
  selectedGoal: Goal | null = null;
  selectedGoalTitle: string = '';
  selectedGoalTasks: Task[] = [];
  selectedGoalCategory: string = '';
  selectedGoalProgress: GoalProgress | null = null;

  private resetGoalTasksModal(): void {
    this.selectedGoalTasks = [];
    this.selectedGoal = null;
    this.selectedGoalTitle = '';
    this.selectedGoalCategory = '';
    this.selectedGoalProgress = null;
    this.goalDetailsError = '';
  }

  protected closeGoalTasksModal(): void {
    this.isGoalTasksModalOn = false;
    this.resetGoalTasksModal();
  }

  protected openGoalDetails(id: number): void {
    this.resetGoalTasksModal();
    this.selectedGoal = this.goals.find(g => g.id === id) ?? null;

    if(!this.selectedGoal) {
      this.isGoalTasksLoading = false;
      this.isGoalTasksModalOn = false;
      this.goalDetailsError = "Erreur lors du chargement des détails de l'objectif";
      return;
    }

    this.isGoalTasksLoading = true;
    this.isGoalTasksModalOn = true;

    this.selectedGoalTitle = this.selectedGoal.title;
    this.selectedGoalCategory = this.selectedGoal.categoryTitle;
    this.selectedGoalProgress = this.getGoalProgressById(id);

    this.api.getGoalTasks(id).pipe(finalize(() => {this.isGoalTasksLoading = false;})).subscribe({
      next: (tasks) => {
        this.selectedGoalTasks = tasks;
      },
      error: () => {
        this.isGoalTasksModalOn = false;
        this.resetGoalTasksModal();
        this.goalDetailsError = "Erreur lors du chargement des détails de l'objectif";
      }
    });
  }
}