import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import {ChartService} from '../../services/chart.service';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit {
  public lineChartData: ChartDataSets[] = [];
  public lineChartLabels: Label[] = [];
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    annotation: {
      annotations: [],
    },
    responsive: true,
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      xAxes: [{
        id: 'x-axis-0',
        ticks: {
          fontColor: 'white'
        }
      }],
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
      backgroundColor: 'rgb(255, 165, 0)',
      borderColor: 'rgb(255, 165, 0)',
      pointBackgroundColor: 'rgb(255, 165, 0)',
      pointBorderColor: 'rgb(255, 165, 0)',
      pointHoverBackgroundColor: 'rgb(255, 165, 0)',
      pointHoverBorderColor: 'rgb(255, 165, 0)'
    }
  ];

  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

  constructor(private chartService: ChartService) { }

  ngOnInit(): void {
    this.chartService.labels.subscribe(labels => this.lineChartLabels = labels);
    this.chartService.data.subscribe(data => this.lineChartData.push(data));
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

}
