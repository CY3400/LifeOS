import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Api, Priority, TaskSchedule } from "../../services/api";
import { MatSnackBar } from "@angular/material/snack-bar";
import { getPriorityClass } from "../../shared/utils/schedule-utils";
import { getTaskTitle } from "../../shared/utils/task-utils";
import { ScheduleActionModal } from "../../shared/components/schedule-action-modal/schedule-action-modal";
import { ScheduleFormModal } from "../../shared/components/schedule-form-modal/schedule-form-modal";
import { KpiSummary } from "../../shared/components/kpi-summary/kpi-summary";
import { DashboardBase } from "../../shared/base/dashboard-base";
import { FocusTodayCard } from "../../shared/components/focus-today-card/focus-today-card";
import { TodayScheduleList } from "../../shared/components/today-schedule-list/today-schedule-list";

@Component({
  selector: 'app-today',
  imports: [CommonModule, ScheduleActionModal, ScheduleFormModal, KpiSummary, FocusTodayCard, TodayScheduleList],
  templateUrl: './today.html',
  styleUrls: ['./today.scss', '../../shared/styles/_variables.scss', '../../shared/styles/_errors.scss'],
})
export class Today extends DashboardBase implements OnInit {
  today: Date = new Date();
  todaySchedules: TaskSchedule[] = [];
  priorityOrder: Record<Priority, number> = {
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1
  };

  //imported functions
  protected override refreshAfterDataChange(): void {
    this.refreshToday();
  }

  protected override getScheduleTaskDescription(taskId: number): string {
    const task = this.tasks.find(t => t.id === taskId);

    return task?.description ? task.description : '';
  }

  protected override getSchedulePriorityClass(priority: Priority | null): string {
    return getPriorityClass(priority);
  }

  //getter
  protected getScheduleDisplayForChild = (schedule: TaskSchedule) => {
    return this.getScheduleDisplay(schedule);
  }

  //constructor
  constructor(api: Api, snack: MatSnackBar) {
    super(api, snack);
  }

  // Lifecycle / loading
  ngOnInit(): void {
    this.refreshToday();
  }

  private refreshToday(): void {
    this.scheduleErrors.global = '';

    this.loadDashboard(
      () => {
        this.loadSchedulesByDate();
      },
      () => {
        this.scheduleErrors.global = 'Erreur lors du chargement de la vue du jour';
      }
    );
  }

  private loadSchedulesByDate(): void {
    this.loadSchedulesByDateBase(
      this.today,
      (schedules) => {
        this.todaySchedules = schedules;
      },
      () => {
        this.scheduleErrors.global = 'Erreur lors du chargement des plannings';
      }
    );
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
    const titleA = getTaskTitle(a.taskId, this.tasks);
    const titleB = getTaskTitle(b.taskId, this.tasks);

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
}
