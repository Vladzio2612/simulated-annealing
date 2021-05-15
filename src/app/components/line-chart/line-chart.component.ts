import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ChartDataSets, ChartOptions} from 'chart.js';
import {BaseChartDirective, Label} from 'ng2-charts';
import {ChartService} from '../../services/chart.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit, OnDestroy {

  functionList: Map<string, string> = new Map([
    ['linearFunction', 'Лінійна'],
    ['exponentialFunction', 'Експоненційна'],
    ['inverseFunction', 'Зворотня'],
    ['logarithmicFunction', 'Логарифмічна']
  ]);
  public lineChartData: ChartDataSets[] = [
    {data: [], label: '',}];
  public lineChartLabels: Label[] = [];
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    annotation: {},
    responsive: true
  };
  public lineChartPlugins = [];

  sub: Subscription;

  @ViewChild(BaseChartDirective, {static: true}) chart: BaseChartDirective;

  constructor(private chartService: ChartService) {
  }

  ngOnInit(): void {
    this.sub = this.chartService.labels.subscribe(labels => {
      if (labels.length > this.lineChartLabels.length) {
        this.lineChartLabels = labels;
      }
    });
    this.sub.add(this.chartService.data.subscribe(data => {
      if (data.data.length > 0) {
        const color = this.generateColor();
        data.backgroundColor = color.replace(')', ', 0.1)');
        data.borderColor = color;
        data.pointBorderColor = color;
        data.pointBackgroundColor = color;
        data.fill = false;
        data.label = this.functionList.get(data.label);
        if (this.lineChartData[0].data.length === 0) {
          this.lineChartData[0].data = data.data;
          this.lineChartData[0].label = data.label;
          this.lineChartData[0].fill = false;
        } else {
          this.lineChartData.push(data);
        }
      }
    }));
  }

  public chartHovered({event, active}: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  generateColor() {
    return 'rgb(' + Math.floor(Math.random() * 255)
      + ',' + Math.floor(Math.random() * 255)
      + ',' + Math.floor(Math.random() * 255) + ')';
  }
}
