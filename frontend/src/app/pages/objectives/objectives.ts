import { Component, OnInit } from '@angular/core';
import { Api } from '../../services/api';
import { finalize } from 'rxjs';
import { ObjectiveSummaryCard } from '../../shared/components/objective-summary-card/objective-summary-card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ObjectiveDetailsModal } from '../../shared/components/objective-details-modal/objective-details-modal';
import { GoalDetailsBase } from '../../shared/base/goal-details-base';
import { hasAnyErrors } from '../../shared/utils/ui-utils';

@Component({
  selector: 'app-objectives',
  imports: [ObjectiveSummaryCard, ObjectiveDetailsModal],
  templateUrl: './objectives.html',
  styleUrls: ['./objectives.scss', '../../shared/styles/_dashboard-cards.scss', '../../shared/styles/_errors.scss', '../../shared/styles/_page-layout.scss'],
})
export class Objectives extends GoalDetailsBase implements OnInit {
  isLoading: boolean = false;
  errors = {
    global: ''
  };

  constructor(api: Api, snack: MatSnackBar){
    super(api, snack);
  }

  protected override refreshAfterDataChange(): void {
    this.refreshObjectives();
  }
  protected hasAnyErrors = hasAnyErrors;

  private refreshObjectives(): void {
    this.errors.global = '';
    this.isLoading = true;
    
    this.api.getGoals().pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (goals) => {
        this.goals = goals;
      },
      error: () => {
        this.errors.global = 'Erreur lors du chargement des objectifs';
        this.goals = [];
      }
    });

    this.loadGoalProgress();
  }

  ngOnInit(): void {
    this.refreshObjectives();
  }
}
