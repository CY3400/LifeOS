import { Component, Input } from "@angular/core";
import { TaskSchedule } from "../../../services/api";
import { ScheduleDisplay } from "../../types/schedule-display";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-focus-today-card",
    templateUrl: "./focus-today-card.html",
    imports: [CommonModule],
    styleUrls: ["./focus-today-card.scss", "../../styles/_badges.scss", "../../styles/_variables.scss"]
})
export class FocusTodayCard {
    @Input() getScheduleDisplay!: (schedule: TaskSchedule) => ScheduleDisplay | null;
    @Input() focusSchedule: TaskSchedule | null = null;
}