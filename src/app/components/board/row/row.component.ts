import { Component, OnInit, Input } from '@angular/core';
import {CalculationService} from '../../../services/calculation.service';

@Component({
  selector: 'app-row',
  templateUrl: './row.component.html',
  styleUrls: ['./row.component.scss']
})
export class RowComponent implements OnInit {

  length: number;
  @Input() index: number;
  numbers: number[] = [];

  constructor(private calcService: CalculationService) {
  }

  ngOnInit(): void {
    // this.length = this.calcService.cityCount;
    for (let i = 0; i < this.length; i++) {
      this.numbers.push(i);
    }
  }

}
