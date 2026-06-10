import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Icon } from "../icon/icon";
import { Category, Goal } from "../../../services/api";
import { barColor } from "../../utils/ui-utils";
import { GoalProgress } from "../../../services/api";
import { getCategoryTitle } from "../../utils/task-utils";

@Component({
    selector: 'app-goal-card',
    templateUrl: './goal-card.html',
    imports: [FormsModule, CommonModule, Icon],
    styleUrls: ['../../styles/_dashboard-cards.scss', '../../styles/_buttons.scss', '../../styles/_badges.scss']
})
export class GoalCard {
    @Input() goalSubmit: boolean = false;
    @Input() goalSearch: string = '';
    @Input() goalCategorySearch: number | null = null;
    @Input() categories: Category[] = [];
    @Input() goals: Goal[] = [];
    @Input() goalProgresses: GoalProgress[] = [];

    @Output() goalSearchChange = new EventEmitter<string>();
    @Output() goalCategorySearchChange = new EventEmitter<number | null>();
    @Output() createGoalRequested = new EventEmitter<void>();
    @Output() setGoalToModify = new EventEmitter<{ id: number, title: string, categoryId: number | null}>();
    @Output() deleteGoalRequested = new EventEmitter<Goal>();
    @Output() detailsRequested = new EventEmitter<number>();

    protected barColor = barColor;
    protected getCategoryTitle = getCategoryTitle;
    protected getGoalProgress(goalId: number): GoalProgress | undefined {
        return this.goalProgresses.find(gp => gp.goalId === goalId);
    }
}