import { Component, Input, OnChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ActivityTrendPoint } from '../../types/stats-types';

@Component({
  selector: 'app-activity-trend-chart',
  imports: [BaseChartDirective],
  templateUrl: './activity-trend-chart.html',
  styleUrls: ['./activity-trend-chart.scss'],
})
export class ActivityTrendChart implements OnChanges {
  @Input() data: ActivityTrendPoint[] = [];

  lineChartType: 'line' = 'line';

  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  ngOnChanges(): void {
    this.lineChartData = {
      labels: this.data.map(point => point.label),
      datasets: [
        {
          label: 'Plannings prévus',
          data: this.data.map(point => point.totalPlannings),
          tension: 0.35
        },
        {
          label: 'Plannings complétés',
          data: this.data.map(point => point.completedPlannings),
          tension: 0.35
        }
      ]
    };
  }
}
