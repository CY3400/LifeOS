import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { barColor } from "../../utils/ui-utils";

@Component({
    selector: 'app-kpi-summary',
    imports: [CommonModule],
    templateUrl: './kpi-summary.html',
    styleUrls: [
        '../../styles/_kpi.scss',
        '../../styles/_progress.scss'
    ]
})
export class KpiSummary {
    @Input() totalTasks: number = 0;
    @Input() completedTasks: number = 0;
    @Input() remainingTasks: number = 0;
    @Input() completionRate: number = 0;
    @Input() totalLabel = 'Tâches du jour';
    @Input() completedLabel = 'Tâches complétées';
    @Input() remainingLabel = 'Tâches restantes';

    protected barColor = barColor;
}