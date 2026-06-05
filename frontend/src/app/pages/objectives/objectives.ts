import { Component, OnInit } from '@angular/core';
import { Api, Goal, GoalProgress, Task } from '../../services/api';
import { finalize } from 'rxjs';
import { hasAnyErrors } from '../../shared/utils/ui-utils';
import { ObjectiveSummaryCard } from '../../shared/components/objective-summary-card/objective-summary-card';
import { GoalBase } from '../../shared/base/goal-base';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ObjectiveDetailsModal } from '../../shared/components/objective-details-modal/objective-details-modal';

@Component({
  selector: 'app-objectives',
  imports: [ObjectiveSummaryCard, ObjectiveDetailsModal],
  templateUrl: './objectives.html',
  styleUrls: ['./objectives.scss', '../../shared/styles/_dashboard-cards.scss', '../../shared/styles/_errors.scss'],
})
export class Objectives extends GoalBase implements OnInit {
  isLoading: boolean = false;
  isGoalTasksModalOn: boolean = false;
  isGoalTasksLoading: boolean = false;
  selectedGoal: Goal | null = null;
  selectedGoalTitle: string = '';
  selectedGoalTasks: Task[] = [];
  selectedGoalCategory: string = '';
  selectedGoalProgress: GoalProgress | null = null;
  errors = {
    global: ''
  };

  constructor(api: Api, snack: MatSnackBar){
    super(api, snack);
  }

  protected override refreshAfterDataChange(): void {}

  ngOnInit(): void {
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

  protected hasAnyErrors = hasAnyErrors;

  private resetGoalTasksModal(): void {
    this.selectedGoalTasks = [];
    this.selectedGoal = null;
    this.selectedGoalTitle = '';
    this.selectedGoalCategory = '';
    this.selectedGoalProgress = null;
  }

  protected closeGoalTasksModal(): void {
    this.isGoalTasksModalOn = false;
    this.resetGoalTasksModal();
  }

  protected openGoalDetails(id: number): void {
    this.resetGoalTasksModal();
    this.selectedGoal = this.goals.find(g => g.id === id) ?? null;

    if(!this.selectedGoal) {
      this.isGoalTasksLoading = false;
      this.isGoalTasksModalOn = false;
      this.errors.global = "Erreur lors du chargement des détails de l'objectif";
      return;
    }

    this.isGoalTasksLoading = true;
    this.isGoalTasksModalOn = true;

    this.selectedGoalTitle = this.selectedGoal.title;
    this.selectedGoalCategory = this.selectedGoal.categoryTitle;
    this.selectedGoalProgress = this.getGoalProgressById(id);

    this.api.getGoalTasks(id).pipe(finalize(() => {this.isGoalTasksLoading = false;})).subscribe({
      next: (tasks) => {
        this.selectedGoalTasks = tasks;
      },
      error: () => {
        this.errors.global = "Erreur lors du chargement des détails de l'objectif";
        this.isGoalTasksModalOn = false;
        this.resetGoalTasksModal();
      }
    });
  }
}
