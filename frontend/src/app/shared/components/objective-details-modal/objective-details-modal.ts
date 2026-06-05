import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GoalProgress, Task } from '../../../services/api';
import { CommonModule } from '@angular/common';
import { barColor } from '../../utils/ui-utils';

@Component({
  selector: 'app-objective-details-modal',
  imports: [CommonModule],
  templateUrl: './objective-details-modal.html',
  styleUrls: ['./objective-details-modal.scss', '../../styles/_modals.scss', '../../styles/_badges.scss', '../../styles/_buttons.scss', '../../styles/_dashboard-cards.scss'],
})
export class ObjectiveDetailsModal {
  @Input() isOpen: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() title: string = '';
  @Input() categoryTitle: string = '';
  @Input() goalProgress: GoalProgress | null = null;
  @Input() tasks: Task[] = [];

  @Output() closeGoalDetails = new EventEmitter<void>();

  protected barColor = barColor;
}
