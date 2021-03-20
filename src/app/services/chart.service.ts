import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
import {ChartDataSets} from 'chart.js';
import {Label} from 'ng2-charts';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  labels = new Subject<Label[]>();
  data = new Subject<ChartDataSets>();

  constructor() { }
}
