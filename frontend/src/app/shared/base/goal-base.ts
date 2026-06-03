import { finalize } from "rxjs";
import { Goal, GoalProgress } from "../../services/api";
import { getGenericErrorMessage, getSuccessMessage, getValidationMessage } from "../utils/messages-utils";
import { CategoryBase } from "./category-base";

export abstract class GoalBase extends CategoryBase {
    goalTitle: string = '';
    goalCategoryId: number | null = null;
    goalSubmit: boolean = false;
    isGoalModalOn: boolean = false;
    modifyGoalId: number | null = null;
    goalSearch: string = '';
    goalCategorySearch: number | null = null;
    goalProgresses: GoalProgress[] = [];
    goalErrors = {
        global: '',
        title: '',
        category: ''
    }

    protected resetGoalErrors(): void {
        this.goalErrors = {
            global: '',
            title: '',
            category: ''
        };
    }

    private resetGoalForm(): void {
        this.goalTitle = '';
        this.goalCategoryId = null;
        this.modifyGoalId = null;
    }

    private resetGoalUiState(): void {
        this.goalSubmit = false;
        this.isGoalModalOn = false;
    }

    private resetGoalModal(): void {
        this.resetGoalErrors();
        this.resetGoalForm();
        this.resetGoalUiState();
    }

    protected openCreateGoalModal(): void {
        this.resetGoalModal();
        this.isGoalModalOn = true;
    }

    protected setGoalModalState(isOpen: boolean): void {
        if (isOpen) {
            this.resetGoalErrors();
            this.goalSubmit = false;
            this.isGoalModalOn = true;
            return;
        }

        this.resetGoalModal();
    }

    protected setGoalToModify(id: number, title: string, categoryId: number | null): void {
        this.modifyGoalId = id;
        this.goalTitle = title;
        this.goalCategoryId = categoryId;
        this.setGoalModalState(true);
    }

    protected saveGoal(): void {
        this.resetGoalErrors();

        const title = this.goalTitle.trim();
        const categoryId = this.goalCategoryId;

        if (title === '') {
            this.goalErrors.title = getValidationMessage("goalTitleRequired");
            return;
        }

        if (categoryId === null) {
            this.goalErrors.category = getValidationMessage("goalCategoryRequired");
            return;
        }

        this.goalSubmit = true;

        const request$ = this.modifyGoalId !== null ? this.api.updateGoal(this.modifyGoalId, title, categoryId) : this.api.createGoal(title, categoryId);

        request$.pipe(
            finalize(() => {
                this.goalSubmit = false;
            })
        ).subscribe({
            next: (goal) => {
                if (this.modifyGoalId !== null) {
                    const index = this.goals.findIndex(g => g.id === goal.id);
                    if (index !== -1) {
                        this.goals[index] = goal;
                        this.setSuccessMessage(getSuccessMessage('goal', 'update'));
                    }
                } else {
                    this.goals.push(goal);
                    this.setSuccessMessage(getSuccessMessage('goal', 'create'));
                }

                this.setGoalModalState(false);
            },
            error: () => {
                this.goalErrors.global = this.modifyGoalId !== null ? getGenericErrorMessage('goal', 'update') : getGenericErrorMessage('goal', 'create');
            }
        });
    }

    protected filteredGoals(): Goal[] {
        const search = this.goalSearch.trim().toLocaleLowerCase();
        const selectedCategoryId = this.goalCategorySearch;

        return this.goals.filter(goal => {
            const activeGoals = goal.status === 'ACTIVE';
            const matchesSearch = !search || goal.title.toLocaleLowerCase().includes(search);
            const matchesCategory = selectedCategoryId === null || goal.categoryId === selectedCategoryId;

            return activeGoals && matchesSearch && matchesCategory;
        });
    }

    protected loadGoalProgress(): void {
        this.api.getGoalProgress().subscribe({
            next: (goalProgress) => {
                this.goalProgresses = goalProgress;
            },
            error: () => {
                console.error('Erreur lors du chargement de la progression des objectifs');
            }
        });
    }

    protected getGoalProgressById(id: number): GoalProgress {
        return this.goalProgresses.find(gp => gp.goalId === id) ?? {
            goalId: id,
            totalPlannings: 0,
            completedPlannings: 0,
            remainingPlannings: 0,
            progressRate: 0
        };
    }
}