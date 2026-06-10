import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GoalProgress } from '../../../services/api';
import { barColor } from '../../utils/ui-utils';
import { CommonModule } from '@angular/common';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-objective-summary-card',
  imports: [CommonModule, Icon],
  templateUrl: './objective-summary-card.html',
  styleUrls: ['../../styles/_dashboard-cards.scss', '../../styles/_badges.scss', '../../styles/_buttons.scss', './objective-summary-card.scss'],
})
export class ObjectiveSummaryCard {
  @Input() title: string = '';
  @Input() goalProgress: GoalProgress | null = null;
  @Input() categoryTitle: string = '';
  @Input() showDetailsButton: boolean = true;
  @Input() showRestoreButton: boolean = false;

  @Output() detailsRequested = new EventEmitter<void>();
  @Output() restoreRequested = new EventEmitter<void>();

  protected barColor = barColor;
}
