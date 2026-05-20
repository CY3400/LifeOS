import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Api, Category, Goal, Priority, Task, TaskSchedule } from "../../services/api";
import { FormsModule } from "@angular/forms";
import { finalize, Observable } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { formatDate, formatTime } from "../../shared/utils/date-utils";
import { barColor, hasAnyErrors } from "../../shared/utils/ui-utils";

type ScheduleDisplay = {
  taskTitle: string;
  timeLabel: string;
  priorityLabel: string;
  priorityClass: string;
  categoryTitle: string;
  taskDescription: string;
}

type ScheduleAction = 'create' | 'update' | 'delete' | 'complete' | 'uncomplete';

@Component({
  selector: 'app-today',
  imports: [CommonModule, FormsModule],
  templateUrl: './today.html',
  styleUrls: ['./today.scss', '../../shared/styles/_kpi.scss', '../../shared/styles/_variables.scss', '../../shared/styles/_errors.scss', '../../shared/styles/_modals.scss', '../../shared/styles/_forms.scss', '../../shared/styles/_badges.scss', '../../shared/styles/_buttons.scss', '../../shared/styles/_repeat-schedule.scss'],
})
export class Today implements OnInit {
  today: Date = new Date();
  todaySchedules: TaskSchedule[] = [];
  priorityOrder: Record<Priority, number> = {
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1
  };

  tasks: Task[] = [];
  categories: Category[] = [];
  goals: Goal[] = [];
  totalTasks: number = 0;
  completedTasks: number = 0;
  remainingTasks: number = 0;
  completionRate: number = 0;

  isScheduleModalOpen: boolean = false;
  scheduleSubmit: boolean = false;
  modifyScheduleId: number | null = null;
  selectedTaskId: number | null = null;
  scheduleDate: string = '';
  scheduleStartTime: string = '';
  scheduleEndTime: string = '';
  schedulePriority: Priority | null = null;
  repeatSchedule: boolean = false;
  startDate: string = '';
  endDate: string = '';
  daysChosen: number[] = [];
  scheduleErrors = {
    taskId: '',
    date: '',
    endTime: '',
    startDate: '',
    endDate: '',
    daysChosen: '',
    global: ''
  };

  isDeleteModalOpen: boolean = false;
  selectedScheduleId: number = 0;
  isUpdateModalOpen: boolean = false;
  errors = {
    global: ''
  };

  deleteErrors = {
    global: ''
  };

  updateErrors = {
    global: ''
  };

  todayDate: Date = new Date();

  //imported functions
  protected barColor = barColor;
  protected hasAnyErrors = hasAnyErrors;

  //constructor
  constructor(private api: Api, private snack: MatSnackBar) {}

  // Lifecycle / loading
  ngOnInit(): void {
    this.refreshToday();
  }

  private refreshToday(): void {
    this.errors.global = '';

    this.api.today().subscribe({
        next: (dashboard) => {
          this.totalTasks = dashboard.totalTasks;
          this.completedTasks = dashboard.completedTasks;
          this.remainingTasks = dashboard.totalTasks - dashboard.completedTasks;
          this.completionRate = dashboard.completionRate;
          this.tasks = dashboard.tasks;
          this.categories = dashboard.categories;
          this.goals = dashboard.goals;

          this.loadSchedulesByDate();
        },
        error: () => {
          this.errors.global = 'Erreur lors du chargement de la vue du jour';
        }
    });
  }

  private loadSchedulesByDate(): void {
    const formattedDate = formatDate(this.today);

    this.api.getTaskSchedulesByDate(formattedDate).subscribe({
      next: (schedules) => {
        this.todaySchedules = schedules;
      },
      error: () => {
        this.errors.global = 'Erreur lors du chargement des plannings du jour';
      }
    });
  }

  // Sorting
  private compareByPriority(a: TaskSchedule, b: TaskSchedule): number {
    const priorityA = a.priority ? this.priorityOrder[a.priority] : 0;
    const priorityB = b.priority ? this.priorityOrder[b.priority] : 0;

    if (priorityB !== priorityA) {
      return priorityB - priorityA;
    }

    return 0;
  }

  private compareByTime(a: TaskSchedule, b: TaskSchedule): number {
    const startTimeA = a.startTime === null || a.startTime === undefined ? '' : a.startTime;
    const startTimeB = b.startTime === null || b.startTime === undefined ? '' : b.startTime;

    if (startTimeA === '' && startTimeB !== '') {
      return 1;
    }

    if (startTimeB === '' && startTimeA !== '') {
      return -1;
    }

    if (startTimeA !== '' && startTimeB !== '' && startTimeA !== startTimeB) {
      return startTimeA.localeCompare(startTimeB);
    }

    return 0;
  }

  private compareByTaskTitle(a: TaskSchedule, b: TaskSchedule): number {
    const titleA = this.getTaskTitle(a.taskId);
    const titleB = this.getTaskTitle(b.taskId);

    return titleA.localeCompare(titleB);
  }

  protected schedulesToDoToday(): TaskSchedule[] {
    return [...this.todaySchedules]
      .filter(s => !s.completed)
      .sort((a, b) =>
        this.compareByPriority(a, b) ||
        this.compareByTime(a, b) ||
        this.compareByTaskTitle(a, b)
      );
  }

  protected schedulesCompleted(): TaskSchedule[] {
    return [...this.todaySchedules]
      .filter(s => s.completed)
      .sort((a, b) =>
        this.compareByTime(a, b) ||
        this.compareByTaskTitle(a, b)
      );
  }

  protected scheduleFocus(): TaskSchedule | null {
    const schedules = this.schedulesToDoToday();

    return schedules.length > 0 ? schedules[0] : null;
  }

  // Display helpers
  protected getScheduleDisplay(schedule: TaskSchedule | null): ScheduleDisplay | null {
    let timeLabel = '';

    if (!schedule) {
      return null;
    }

    if (schedule.startTime && schedule.endTime) {
      timeLabel = `(${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)})`;
    }
    else if (schedule.startTime) {
      timeLabel = `(${formatTime(schedule.startTime)})`;
    }

    return {
      taskTitle: this.getTaskTitle(schedule.taskId),
      timeLabel,
      priorityLabel: this.getPriorityName(schedule.priority),
      categoryTitle: this.getCategoryTitleByTask(schedule.taskId),
      taskDescription: this.getTaskDescription(schedule.taskId),
      priorityClass: this.getPriorityClass(schedule.priority)
    }
  }

  private getTaskTitle(id: number): string {
    const task = this.tasks.find(t => t.id === id);
    return task ? task.title : '';
  }

  private getTaskDescription(id: number): string {
    const task = this.tasks.find(t => t.id === id);

    return task?.description ? task.description : '';
  }

  private getPriorityName(priority: Priority | null | undefined): string {
    if (priority === 'HIGH') {
      return 'Haute';
    }
    else if (priority === 'MEDIUM') {
      return 'Moyenne';
    }
    else if (priority === 'LOW'){
      return 'Basse';
    }
    else {
      return 'Sans priorité';
    }
  }

  private getPriorityClass(priority: Priority | null | undefined): string {
    let priorityClass = '';

    if (priority === 'HIGH') {
      priorityClass = 'high';
    }
    else if (priority === 'MEDIUM') {
      priorityClass = 'medium';
    }
    else if (priority === 'LOW') {
      priorityClass = 'low';
    }
    else {
      priorityClass = 'none';
    }

    return priorityClass;
  }

  private getCategoryTitleByTask(taskId: number): string {
    const task = this.tasks.find(t => t.id === taskId);
    
    if(task?.categoryId) {
        return this.getCategoryTitle(task.categoryId);
    }
    else if(task?.goalId) {
        return this.getCategoryTitle(this.getCategoryIdByGoal(task.goalId));
    }
    
    return '';
  }

  private getCategoryTitle(catId: number | null): string {
    const category = this.categories.find(c => c.id === catId);
    return category ? category.title : '';
  }

  private getCategoryIdByGoal(goalId: number | null) : number | null {
    const goal = this.goals.find(g => g.id === goalId);
    return goal ? goal.categoryId : null;
  }

  // Schedule modal
  protected setScheduleModalState(isOpen: boolean): void {
    if(isOpen) {
      this.resetScheduleErrors();
      this.scheduleSubmit = false;
      this.isScheduleModalOpen = true;
      return;
    }

    this.resetScheduleModal();
  }

  private resetScheduleModal(): void {
    this.resetScheduleErrors();
    this.resetScheduleForm();
    this.resetScheduleUiState();
  }

  private resetScheduleForm(): void {
    this.selectedTaskId = null;
    this.scheduleDate = '';
    this.scheduleStartTime = '';
    this.scheduleEndTime = '';
    this.schedulePriority = 'MEDIUM';

    this.repeatSchedule = false;
    this.startDate = '';
    this.endDate = '';
    this.daysChosen = [];

    this.modifyScheduleId = null;
  }

  private resetScheduleUiState(): void {
    this.scheduleSubmit = false;
    this.isScheduleModalOpen = false;
  }

  private resetScheduleErrors(): void {
    this.scheduleErrors = {
      global: '',
      taskId: '',
      date: '',
      endTime: '',
      startDate: '',
      endDate: '',
      daysChosen: ''
    };
  }

  protected setModifySchedule(schedule: TaskSchedule): void {
    this.setScheduleModalState(true);
    this.modifyScheduleId = schedule.id;
    this.selectedTaskId = schedule.taskId;
    this.scheduleDate = schedule.taskDate;
    this.scheduleStartTime = schedule.startTime || '';
    this.scheduleEndTime = schedule.endTime || '';
    this.schedulePriority = schedule.priority || null;
  }

  protected toggleRepeatSchedule(): void {
    this.repeatSchedule = !this.repeatSchedule;
    if (!this.repeatSchedule) {
      this.startDate = '';
      this.endDate = '';
      this.daysChosen = [];
    }
  }

  protected toggleDay(day: number): void {
    if (this.daysChosen.includes(day)) {
      this.daysChosen = this.daysChosen.filter(d => d !== day);
    }
    else {
      this.daysChosen = [...this.daysChosen, day];
    }
  }

  // Validation
  private validateScheduleRequest(): boolean {
    const taskId = this.selectedTaskId;
    const taskDate = this.scheduleDate;
    const startTime = this.scheduleStartTime || null;
    const endTime = this.scheduleEndTime || null;

    let isValid = true;

    this.resetScheduleErrors();

    if (!taskId) {
        this.scheduleErrors.taskId = this.getValidationMessage('scheduleTaskRequired');
        isValid = false;
    }

    if (!taskDate && !this.repeatSchedule) {
        this.scheduleErrors.date = this.getValidationMessage('scheduleDateRequired');
        isValid = false;
    }

    if (this.repeatSchedule && !this.startDate) {
        this.scheduleErrors.startDate = this.getValidationMessage('scheduleStartDateRequired');
        isValid = false;
    }

    if (this.repeatSchedule && !this.endDate) {
        this.scheduleErrors.endDate = this.getValidationMessage('scheduleEndDateRequired');
        isValid = false;
    }

    if (this.repeatSchedule && !this.daysChosen.length) {
        this.scheduleErrors.daysChosen = this.getValidationMessage('scheduleDaysRequired');
        isValid = false;
    }

    if (this.repeatSchedule && this.startDate && this.endDate && this.endDate < this.startDate) {
        this.scheduleErrors.endDate = this.getValidationMessage('scheduleEndAfterStart');
        isValid = false;
    }

    if (endTime && !startTime) {
        this.scheduleErrors.endTime = "L'heure de début est requise si une heure de fin est fournie";
        isValid = false;
    }

    if (startTime && endTime && endTime <= startTime) {
        this.scheduleErrors.endTime = "L'heure de fin doit être après l'heure de début";
        isValid = false;
    }

    return isValid;
  }

  private getValidationMessage(key: 'scheduleTaskRequired' | 'scheduleDateRequired' | 'scheduleStartDateRequired' | 'scheduleEndDateRequired' | 'scheduleDaysRequired' | 'scheduleEndAfterStart'): string {
    const messages = {
      scheduleTaskRequired: 'La tâche est obligatoire',
      scheduleDateRequired: 'La date est obligatoire',
      scheduleStartDateRequired: 'La date de début est obligatoire pour une répétition',
      scheduleEndDateRequired: 'La date de fin est obligatoire pour une répétition',
      scheduleDaysRequired: 'Au moins un jour doit être choisi pour une répétition',
      scheduleEndAfterStart: 'La date de fin doit être après la date de début'
    };

    return messages[key];
  }

  // Actions
  protected saveSchedule(): void {
    const taskId = this.selectedTaskId;
    const taskDate = this.scheduleDate;
    const startTime = this.scheduleStartTime || null;
    const endTime = this.scheduleEndTime || null;
    const priority = this.schedulePriority || null;

    if (!this.validateScheduleRequest()) return;

    if (this.modifyScheduleId !== null) {
      const modifyScheduleId = this.modifyScheduleId;

      this.resetScheduleUiState();
      this.setScheduleActionModalState('update', true, modifyScheduleId);
      return;
    }

    this.scheduleSubmit = true;
    
    if (!this.repeatSchedule) {
      this.performScheduleSave(this.api.createTaskSchedule({taskId: taskId!, taskDate, startTime, endTime, priority}), this.getScheduleErrorMessage('create'), this.getScheduleSuccessMessage('create'));
      return;
    }

    const startDate = this.startDate;
    const endDate = this.endDate;
    const daysChosen = this.daysChosen;

    this.performScheduleSave(this.api.repeatTaskSchedules(taskId!, startDate, endDate, startTime, endTime, daysChosen, priority), this.getScheduleErrorMessage('create'), this.getScheduleSuccessMessage('create'));
  }

  protected completeSchedule(id: number, completed: boolean): void {
    this.errors.global = '';

    this.api.completeTaskSchedule(id, completed).subscribe({
        next: () => {
          this.refreshToday();

          this.setSuccessMessage(completed ? this.getScheduleSuccessMessage('complete') : this.getScheduleSuccessMessage('uncomplete'));
        },
        error: () => {
          this.errors.global = completed ? this.getScheduleErrorMessage('complete') : this.getScheduleErrorMessage('uncomplete');
        }
    });
  }

  protected deleteOneSchedule(id: number): void {
    this.deleteSchedule(id, this.api.deleteTaskSchedule(id));
  }

  protected deleteScheduleFollowing(id: number): void {
    this.deleteSchedule(id, this.api.deleteFollowing(id));
  }

  protected updateOneSchedule(id: number): void {
    this.updateSchedule(id, (taskId, startTime, endTime, priority) => this.api.updateTaskSchedule(id, {taskId, taskDate: this.scheduleDate, startTime, endTime, priority}));
  }

  protected updateScheduleFollowing(id: number): void {
    this.updateSchedule(id, (taskId, startTime, endTime, priority) => this.api.updateFollowing(id, {taskId, taskDate: this.scheduleDate, startTime, endTime, priority}));
  }

  private performScheduleSave(request$: Observable<unknown>, errorMessage: string, successMessage: string): void {
    request$.pipe(
        finalize(() => {
            this.scheduleSubmit = false;
        })
    ).subscribe({
        next: () => {
            this.refreshToday();
            this.setScheduleModalState(false);
            this.setSuccessMessage(successMessage);
        },
        error: () => {
            this.scheduleErrors.global = errorMessage;
        }
    });
  }

  private deleteSchedule(id: number, request$: Observable<void>): void {
    if (id !== 0) {
      this.resetScheduleActionErrors();

      request$.subscribe({
        next: () => {
          this.refreshToday();
          this.setScheduleActionModalState('delete', false);
          this.setSuccessMessage(this.getScheduleSuccessMessage('delete'));
        },
        error: () => {
          this.deleteErrors.global = this.getScheduleErrorMessage('delete');
        }
      });
    }
    else {
      this.deleteErrors.global = this.getScheduleErrorMessage('delete');
    }
  }

  private updateSchedule(id: number, requestFactory: (taskId: number, startTime: string | null, endTime: string | null, priority: Priority | null) => Observable<unknown>): void {
    const taskId = this.selectedTaskId;
    const startTime = this.scheduleStartTime || null;
    const endTime = this.scheduleEndTime || null;
    const priority = this.schedulePriority || null;

    this.resetScheduleActionErrors();

    if (!id || !taskId) {
      this.updateErrors.global = this.getScheduleErrorMessage('update');
      return;
    }

    requestFactory(taskId, startTime, endTime, priority).subscribe({
      next: () => {
        this.refreshToday();
        this.setScheduleActionModalState('update', false);
        this.setScheduleModalState(false);
        this.setSuccessMessage(this.getScheduleSuccessMessage('update'));
      },
      error: () => {
        this.updateErrors.global = this.getScheduleErrorMessage('update');
      }
    });
  }

  // Action modals / messages
  protected setScheduleActionModalState(type: 'delete' | 'update', isOpen: boolean, scheduleId: number = 0): void {
    if (!isOpen) {
      this.resetScheduleActionModal();
      this.resetScheduleForm();
      return;
    }

    this.resetScheduleActionErrors();
    this.selectedScheduleId = scheduleId;

    if (type === 'delete') {
      this.isDeleteModalOpen = true;
      this.isUpdateModalOpen = false;
      return;
    }

    this.isUpdateModalOpen = true;
    this.isDeleteModalOpen = false;
  }

  private resetScheduleActionModal(): void {
    this.resetScheduleActionErrors();
    this.resetScheduleActionState();
  }

  private resetScheduleActionErrors(): void {
    this.deleteErrors = { global: '' };
    this.updateErrors = { global: '' };
  }

  private resetScheduleActionState(): void {
    this.isDeleteModalOpen = false;
    this.isUpdateModalOpen = false;
    this.selectedScheduleId = 0;
  }

  private getScheduleErrorMessage(action: ScheduleAction): string {
    const messages = {
      create: 'Erreur lors de l’ajout du planning',
      update: 'Erreur lors de la modification du planning',
      delete: 'Erreur lors de la suppression du planning',
      complete: 'Erreur lors de la complétion du planning',
      uncomplete: 'Erreur lors de l’annulation de la complétion du planning'
    };

    return messages[action];
  }

  private getScheduleSuccessMessage(action: ScheduleAction): string {
    const messages = {
      create: 'Planning ajouté avec succès',
      update: 'Planning modifié avec succès',
      delete: 'Planning supprimé avec succès',
      complete: 'Planning complété avec succès',
      uncomplete: 'Planning marqué comme non complété'
    };

    return messages[action];
  }

  private setSuccessMessage(message: string): void {
    this.snack.open(message, '✖', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['custom-toast']
    });
  }
}
