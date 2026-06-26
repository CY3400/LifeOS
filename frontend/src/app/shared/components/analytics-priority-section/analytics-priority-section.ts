import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-analytics-priority-section',
  imports: [],
  templateUrl: './analytics-priority-section.html',
  styleUrls: ['./analytics-priority-section.scss', '../../styles/_analytics.scss', '../../styles/_sections.scss'],
})
export class AnalyticsPrioritySection {
  @Input() highPriority: number = 0;
  @Input() completedHighPriority: number = 0;
  @Input() mediumPriority: number = 0;
  @Input() completedMediumPriority: number = 0;
  @Input() lowPriority: number = 0;
  @Input() completedLowPriority: number = 0;
}
