import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { ReviewBreakdown } from '../../types/review-types';

@Component({
  selector: 'app-review-breakdown-section',
  imports: [CommonModule],
  templateUrl: './review-breakdown-section.html',
  styleUrls: ['./review-breakdown-section.scss', '../../styles/_sections.scss'],
})
export class ReviewBreakdownSection {
  @Input() reviews: ReviewBreakdown[] = [];
  @Input() title: string = '';
  @Input() label: string = '';
}
