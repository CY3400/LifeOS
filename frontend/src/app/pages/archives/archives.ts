import { Component, OnInit } from '@angular/core';
import { Api, Category, Goal, Task } from '../../services/api';
import { finalize, forkJoin } from 'rxjs';
import { hasAnyErrors } from '../../shared/utils/ui-utils';
import { ObjectiveSummaryCard } from '../../shared/components/objective-summary-card/objective-summary-card';
import { GoalDetailsBase } from '../../shared/base/goal-details-base';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Icon } from '../../shared/components/icon/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { ArchiveSection } from '../../shared/components/archive-section/archive-section';

@Component({
  selector: 'app-archives',
  imports: [ObjectiveSummaryCard, Icon, ArchiveSection],
  templateUrl: './archives.html',
  styleUrls: ['./archives.scss', '../../shared/styles/_errors.scss', '../../shared/styles/_badges.scss', '../../shared/styles/_buttons.scss', '../../shared/styles/_page-layout.scss']
})
export class Archives extends GoalDetailsBase implements OnInit {
  archivedGoals: Goal[] = [];
  archivedTasks: Task[] = [];
  archivedCategories: Category[] = [];
  isLoading: boolean = false;
  errors = {
    global: ''
  };

  constructor(api: Api, snack: MatSnackBar){
    super(api, snack);
  }

  protected override refreshAfterDataChange(): void {
    this.refreshArchives();
  }
  protected hasAnyErrors = hasAnyErrors;

  private refreshArchives(): void {
    this.errors.global = '';
    this.isLoading = true;

    forkJoin({
      goals: this.api.getGoals('ARCHIVED'),
      tasks: this.api.getTasks('ARCHIVED'),
      categories: this.api.getCategories('ARCHIVED')
    }).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (result) => {
        this.archivedGoals = result.goals;
        this.archivedTasks = result.tasks;
        this.archivedCategories = result.categories;
      },
      error: () => {
        this.errors.global = 'Erreur lors du chargement des archives';
        this.archivedGoals = [];
        this.archivedTasks = [];
        this.archivedCategories = [];
      }
    });

    this.loadGoalProgress('ARCHIVED');
  }

  private setErrorMessage(error: HttpErrorResponse, fallbackMessage: string): void {
    const backendMessage = error?.error?.message ?? '';

    this.errors.global = backendMessage !== '' ? backendMessage : fallbackMessage;
  }

  ngOnInit(): void {
    this.refreshArchives();
  }

  protected restoreArchivedCategory(id: number): void {
    this.api.restoreCategory(id).subscribe({
      next: () => {
        this.refreshArchives();
      },
      error: (error) => {
        this.setErrorMessage(error, 'Erreur lors de la restauration de la catégorie');
      }
    });
  }

  protected restoreArchivedGoal(id: number): void {
    this.api.restoreGoal(id).subscribe({
      next: () => {
        this.refreshArchives();
      },
      error: (error) => {
        this.setErrorMessage(error, "Erreur lors de la restauration de l'objectif");
      }
    });
  }

  protected restoreArchivedTask(id: number): void {
    this.api.restoreTask(id).subscribe({
      next: () => {
        this.refreshArchives();
      },
      error: (error) => {
        this.setErrorMessage(error, 'Erreur lors de la restauration de la tâche');
      }
    });
  }
}
