import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import {ChartService} from '../../services/chart.service';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit {
  public lineChartData: ChartDataSets[] = [
    { data: [], label: 'Функція' }
  ];
  public lineChartLabels: Label[] = [];
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    annotation: undefined,
    responsive: true,
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      xAxes: [{}],
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
          ticks: {
            fontColor: 'white'
          }
        }
      ]
    }
  };
  public lineChartColors: Color[] = [
    { // red
      backgroundColor: 'rgb(195,114,152, 0.6)',
      borderColor: 'rgb(194,24,91)',
      pointBackgroundColor: 'rgb(0,255,21)',
      pointBorderColor: 'rgb(0,255,21)',
      pointHoverBackgroundColor: 'rgb(0,255,21)',
      pointHoverBorderColor: 'rgb(0,255,21)'
    }
  ];

  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

  constructor(private chartService: ChartService) { }

  ngOnInit(): void {
    this.chartService.labels.subscribe(labels => this.lineChartLabels = labels);
    this.chartService.data.subscribe(data => this.lineChartData[0].data = data.data );
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

}
