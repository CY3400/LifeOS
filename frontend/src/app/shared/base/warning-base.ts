import { Observable } from "rxjs";
import { getBusinessDeleteErrorMessage, getGenericErrorMessage, getSuccessMessage, getWarningMessage, Warning } from "../utils/messages-utils";
import { TaskBase } from "./task-base";

export abstract class WarningBase extends TaskBase {
    isWarningOpen: boolean = false;
    warningId: number | null = null;
    warningType: Warning | null = null;
    warningError: string = '';
    warningMessage: string = '';
    canSuggestArchive: boolean = false;

    private resetWarningState(): void {
        this.isWarningOpen = false;
        this.warningType = null;
        this.warningId = null;
        this.warningMessage = '';
        this.warningError = '';
        this.canSuggestArchive = false;
    }

    protected toggleWarning(type: Warning, isOpen: boolean, id: number | null, title: string): void {
        if (!isOpen) {
            this.resetWarningState();
            return;
        }

        this.resetWarningState();

        this.warningType = type;
        this.isWarningOpen = isOpen;
        this.warningId = id;

        if (type === 'category') {
            this.resetCategoryErrors();
        }
        else if (type === 'task') {
            this.resetTaskErrors();
        }
        else {
            this.resetGoalErrors();
        }

        this.warningMessage = getWarningMessage(type, title);
    }

    private getDeleteWarningConfig(type: Warning, id: number): Observable<unknown> {
        if(type === 'category') {
            return this.api.deleteCategory(id);
        }
        else if(type === 'task') {
            return this.api.deleteTask(id);
        }
        else {
            return this.api.deleteGoal(id);
        }
    }

    private getArchiveWarningConfig(type: Warning, id: number): Observable<unknown> {
        if(type === 'category') {
            return this.api.archiveCategory(id);
        }
        else if(type === 'task') {
            return this.api.archiveTask(id);
        }
        else {
            return this.api.archiveGoal(id);
        }
    }

    private errorWarning(errorCode: string, specificMessage: string, globalMessage: string): void {
        const isBusinessDeleteError = errorCode === 'TASK_USED'
        || errorCode === 'GOAL_USED'
        || errorCode === 'CATEGORY_USED';

        if (isBusinessDeleteError) {
            this.warningError = specificMessage;
            this.canSuggestArchive = true;
            this.warningMessage = `La suppression est impossible. Vous pouvez archiver cet élément pour le masquer du dashboard.`;
        }
        else {
            this.warningError = globalMessage;
            this.canSuggestArchive = false;
        }
    }

    private deleteGlobal(type: Warning, request$: Observable<unknown>, id: number, successMessage: string, specificErrorMessage: string, globalErrorMessage: string): void {
        this.warningError = '';

        request$.subscribe({
            next: () => {
                if (type === 'category') {
                    this.categories = this.categories.filter(c => c.id !== id);
                }
                else if (type === 'task') {
                    this.tasks = this.tasks.filter(t => t.id !== id);
                }
                else {
                    this.goals = this.goals.filter(g => g.id !== id);
                }

                this.resetWarningState();
                this.setSuccessMessage(successMessage);
            },
            error: (error) => {
                const backendCode = error?.error?.code ?? '';

                this.errorWarning(backendCode, specificErrorMessage, globalErrorMessage);
            }
        });
    }

    protected confirmWarningDelete(type: Warning, id: number): void {
        this.deleteGlobal(
            type,
            this.getDeleteWarningConfig(type, id),
            id,
            getSuccessMessage(type, 'delete'),
            getBusinessDeleteErrorMessage(type),
            getGenericErrorMessage(type, 'delete')
        );
    }

    private archiveGlobal(request$: Observable<unknown>, successMessage: string, globalErrorMessage: string): void {
        this.warningError = '';

        request$.subscribe({
            next: () => {
                this.refreshAfterDataChange();
                this.resetWarningState();
                this.setSuccessMessage(successMessage);
            },
            error: (error) => {
                const backendMessage = error?.error?.message ?? '';

                this.canSuggestArchive = false;

                if (backendMessage !== '') {
                    this.warningError = backendMessage;
                }
                else {
                    this.warningError = globalErrorMessage;
                }
            }
        });
    }

    protected confirmWarningArchive(type: Warning, id: number): void {
        this.archiveGlobal(
            this.getArchiveWarningConfig(type, id),
            getSuccessMessage(type, 'archive'),
            getGenericErrorMessage(type, 'archive')
        );
    }
}