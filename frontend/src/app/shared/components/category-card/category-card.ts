import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Icon } from "../icon/icon";
import { hasAnyErrors } from "../../utils/ui-utils";
import { Category } from "../../../services/api";

type CategoryErrors = {
    global: string;
    title: string;
};

@Component({
    selector: 'app-category-card',
    templateUrl: './category-card.html',
    imports: [CommonModule, FormsModule, Icon],
    styleUrls: ['../../styles/_dashboard-cards.scss', '../../styles/_buttons.scss', '../../styles/_errors.scss']
})
export class CategoryCard {
    @Input() categorySubmit: boolean = false;
    @Input() newCategoryTitle: string = '';
    @Input() categoryErrors: CategoryErrors = { global: '', title: '' };
    @Input() categorySearch: string = '';
    @Input() modifyCategoryId: number | null = null;
    @Input() modifyCategoryTitle: string = '';
    @Input() categories: Category[] = [];

    @Output() newCategoryTitleChange = new EventEmitter<string>();
    @Output() categorySearchChange = new EventEmitter<string>();
    @Output() modifyCategoryTitleChange = new EventEmitter<string>();
    @Output() submitCategory = new EventEmitter<void>();
    @Output() modifyCategory = new EventEmitter<number>();
    @Output() setCategoryToModify = new EventEmitter<{ id: number | null, title: string | null }>();
    @Output() deleteCategoryRequested = new EventEmitter<Category>();

    protected hasAnyErrors = hasAnyErrors;
}