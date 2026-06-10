import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Api, TaskSchedule } from "../../services/api";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ScheduleActionModal } from "../../shared/components/schedule-action-modal/schedule-action-modal";
import { ScheduleFormModal } from "../../shared/components/schedule-form-modal/schedule-form-modal";
import { KpiSummary } from "../../shared/components/kpi-summary/kpi-summary";
import { WarningBase } from "../../shared/base/warning-base";
import { WarningModal } from "../../shared/components/warning-modal/warning-modal";
import { TaskFormModal } from "../../shared/components/task-form-modal/task-form-modal";
import { GoalFormModal } from "../../shared/components/goal-form-modal/goal-form-modal";
import { CategoryCard } from "../../shared/components/category-card/category-card";
import { GoalCard } from "../../shared/components/goal-card/goal-card";
import { TaskCard } from "../../shared/components/task-card/task-card";
import { SelectedDaySchedules } from "../../shared/components/selected-day-schedules/selected-day-schedules";
import { CalendarDashboardCard } from "../../shared/components/calendar-dashboard-card/calendar-dashboard-card";
import { ObjectiveDetailsModal } from "../../shared/components/objective-details-modal/objective-details-modal";

@Component({
    selector: 'app-home',
    templateUrl: './home.html',
    styleUrls: ['./home.scss', '../../shared/styles/_variables.scss'],
    standalone: true,
    imports: [CommonModule, ScheduleActionModal, ScheduleFormModal, KpiSummary, WarningModal, TaskFormModal, GoalFormModal, CategoryCard, GoalCard, TaskCard, SelectedDaySchedules, CalendarDashboardCard, ObjectiveDetailsModal]
})
export class Home extends WarningBase implements OnInit {
    //imported functions
    protected override refreshAfterDataChange(): void {
        this.refreshHome();
    }

    //constructor
    constructor(api: Api, snack: MatSnackBar) {
        super(api, snack);
    }

    //lifecycle
    ngOnInit(): void {
        this.initializeDates();
        this.refreshHome();
    }

    //load/refresh
    private refreshHome(): void {
        this.loadDashboard(
            () => {
                this.loadSchedulesByDate(this.selectedDate);
                this.updateVisibleRange();
                this.loadSchedulesBetweenDates(this.startDateBetween, this.endDateBetween);
                this.loadGoalProgress();
            },
            () => {
                console.error('Erreur lors du chargement du dashboard');
            }
        );
    }

    //getter
    protected getScheduleDisplayForChild = (schedule: TaskSchedule) => {
        return this.getScheduleDisplay(schedule);
    }
}