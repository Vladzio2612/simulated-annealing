import { Component, OnInit } from '@angular/core';
import {ResultService} from '../../services/result.service';
import {MatTableDataSource} from '@angular/material/table';

export interface Result {
  number?: number;
  cityCount: number;
  method: string;
  iterations: number;
  time: number;
  distance: number;
}

@Component({
  selector: 'app-result-table',
  templateUrl: './result-table.component.html',
  styleUrls: ['./result-table.component.scss']
})
export class ResultTableComponent implements OnInit {

  displayedColumns = ['number', 'cityCount', 'method', 'iterations', 'time', 'distance'];
  dataSource = new MatTableDataSource<Result>();
  results: Result[] = [];
  functionList: Map<string, string> = new Map([
    ['linearFunction', 'Лінійна'],
    ['exponentialFunction', 'Експоненційна'],
    ['inverseFunction', 'Зворотня'],
    ['logarithmicFunction', 'Логарифмічна']
  ]);

  constructor(private resultService: ResultService) { }

  ngOnInit(): void {
    this.dataSource.data = this.results;
    this.resultService.results.subscribe(result => {
      result.number = this.results.length + 1;
      result.method = this.functionList.get(result.method);
      this.results.push(result);
      this.dataSource.data = this.results;
    });
  }

}
