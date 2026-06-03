import { finalize } from "rxjs";
import { Category } from "../../services/api";
import { getGenericErrorMessage, getSuccessMessage, getValidationMessage } from "../utils/messages-utils";
import { CalendarBase } from "./calendar-base";

export abstract class CategoryBase extends CalendarBase {
    newCategoryTitle: string = '';
    categorySubmit: boolean = false;
    modifyCategoryId: number | null = null;
    modifyCategoryTitle: string = '';
    categorySearch: string = '';
    categoryErrors = {
        global: '',
        title: ''
    }

    protected resetCategoryErrors(): void {
        this.categoryErrors = {
            global: '',
            title: ''
        };
    }

    private resetCategoryForm(): void {
        this.newCategoryTitle = '';
    }

    private resetCategoryEditState(): void {
        this.modifyCategoryId = null;
        this.modifyCategoryTitle = '';
    }

    private resetCategoryUiState(): void {
        this.categorySubmit = false;
    }

    private resetCategoryState(): void {
        this.resetCategoryErrors();
        this.resetCategoryForm();
        this.resetCategoryEditState();
        this.resetCategoryUiState();
    }

    protected filteredCategories(): Category[] {
        const search = this.categorySearch.trim().toLocaleLowerCase();

        return this.categories.filter(category => {
            const activeCategories = category.status === 'ACTIVE';
            const matchesSearch = !search || category.title.toLocaleLowerCase().includes(search);

            return activeCategories && matchesSearch;
        });
    }

    protected setCategoryToModify(id: number | null, title: string | null): void {
        this.modifyCategoryId = id;
        this.modifyCategoryTitle = title || '';
    }

    protected submitCategory(): void {
        this.resetCategoryErrors();

        const title = this.newCategoryTitle.trim();

        if (title === '') {
            this.categoryErrors.title = getValidationMessage('categoryTitleRequired');
            return;
        }

        this.categorySubmit = true;
        this.api.createCategory(title).pipe(
            finalize(() => {
                this.categorySubmit = false;
            })
        ).subscribe({
            next: (category) => {
                this.categories.push(category);
                this.resetCategoryForm();
                this.setSuccessMessage(getSuccessMessage('category', 'create'));
            },
            error: () => {
                this.categoryErrors.global = getGenericErrorMessage('category', 'create');
            }
        });
    }

    protected modifyCategory(id: number): void {
        this.resetCategoryErrors();

        const title = this.modifyCategoryTitle.trim();

        if (title === '') {
            this.categoryErrors.title = getValidationMessage('categoryTitleRequired');
            return;
        }

        this.categorySubmit = true;

        this.api.updateCategory(id, title).subscribe({
            next: (category) => {
                const index = this.categories.findIndex(c => c.id === id);
                if (index !== -1) {
                    this.categories[index] = category;
                    this.resetCategoryState();
                    this.setSuccessMessage(getSuccessMessage('category', 'update'));
                }
            },
            error: () => {
                this.categoryErrors.global = getGenericErrorMessage('category', 'update');
            }
        });
    }
}