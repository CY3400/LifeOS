import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Icon } from "../icon/icon";
import { Category, Goal, Task } from "../../../services/api";
import { TaskSortBy } from "../../types/sort-types";

@Component({
    selector: 'app-task-card',
    templateUrl: './task-card.html',
    imports: [FormsModule, CommonModule, Icon],
    styleUrls: ['../../styles/_dashboard-cards.scss', '../../styles/_buttons.scss']
})
export class TaskCard {
    @Input() taskSubmit: boolean = false;
    @Input() taskSearch: string = '';
    @Input() taskCategorySearch: number | null = null;
    @Input() categories: Category[] = [];
    @Input() taskGoalSearch: number | null = null;
    @Input() goals: Goal[] = [];
    @Input() tasks: Task[] = [];
    @Input() taskSortBy: TaskSortBy = 'title';

    @Output() taskSearchChange = new EventEmitter<string>();
    @Output() taskCategorySearchChange = new EventEmitter<number | null>();
    @Output() taskGoalSearchChange = new EventEmitter<number | null>();
    @Output() taskSortByChange = new EventEmitter<TaskSortBy>();
    @Output() createTaskRequested = new EventEmitter<void>();
    @Output() editTaskRequested = new EventEmitter<{id: number, title: string, description: string, goalId: number | null, categoryId: number | null}>();
    @Output() deleteTaskRequested = new EventEmitter<Task>();
}