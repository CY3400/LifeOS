import { Component, EventEmitter, Input, Output } from "@angular/core";
import { hasAnyErrors } from "../../utils/ui-utils";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Category } from "../../../services/api";

type GoalErrors = {
    global: string;
    title: string;
    category: string;
};

@Component({
    selector: 'app-goal-form-modal',
    imports: [CommonModule, FormsModule],
    templateUrl: './goal-form-modal.html',
    styleUrls: ['../../styles/_modals.scss', '../../styles/_forms.scss', '../../styles/_errors.scss', '../../styles/_buttons.scss']
})
export class GoalFormModal {
    @Input() isGoalModalOn: boolean = false;
    @Input() goalErrors: GoalErrors = { global: '', title: '', category: '' };
    @Input() modifyGoalId: number | null = null;
    @Input() goalSubmit: boolean = false;
    @Input() goalTitle: string = '';
    @Input() goalCategoryId: number | null = null;
    @Input() categories: Category[] = [];

    @Output() goalTitleChange = new EventEmitter<string>();
    @Output() goalCategoryIdChange = new EventEmitter<number | null>();
    @Output() saveGoal = new EventEmitter<void>();
    @Output() closeGoalModal = new EventEmitter<void>();

    protected hasAnyErrors = hasAnyErrors;
}