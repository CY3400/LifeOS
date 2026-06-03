import { Component, EventEmitter, Input, Output } from "@angular/core";
import { hasAnyErrors } from "../../utils/ui-utils";
import { Category, Goal } from "../../../services/api";
import { FormsModule } from "@angular/forms";

type TaskErrors = {
    title: string;
    global: string;
};

@Component({
  selector: 'app-task-form-modal',
  imports: [FormsModule],
  templateUrl: './task-form-modal.html',
  styleUrls: ['../../styles/_modals.scss', '../../styles/_forms.scss', '../../styles/_errors.scss', '../../styles/_buttons.scss']
})
export class TaskFormModal {
    @Input() isTaskModalOpen: boolean = false;
    @Input() taskErrors: TaskErrors = {
        title: '',
        global: ''
    };
    @Input() modifyTaskId: number | null = null;
    @Input() taskSubmit: boolean = false;
    @Input() taskTitle: string = '';
    @Input() taskDescription: string = '';
    @Input() selectedTaskCategoryId: number | null = null;
    @Input() selectedGoalId: number | null = null;
    @Input() goals: Goal[] = [];
    @Input() categories: Category[] = [];

    @Output() saveTask = new EventEmitter<void>();
    @Output() onTaskGoalChange = new EventEmitter<void>();
    @Output() onTaskCategoryChange = new EventEmitter<void>();
    @Output() closeTaskModal = new EventEmitter<void>();
    @Output() taskTitleChange = new EventEmitter<string>();
    @Output() taskDescriptionChange = new EventEmitter<string>();
    @Output() selectedGoalIdChange = new EventEmitter<number | null>();
    @Output() selectedTaskCategoryIdChange = new EventEmitter<number | null>();

    protected hasAnyErrors = hasAnyErrors;
}