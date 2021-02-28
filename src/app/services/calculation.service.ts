import {EventEmitter, Injectable, Output} from '@angular/core';
import {TimerService} from './timer.service';

class MemberType {

  solution: number[];
  energy = 0;

  constructor(length: number) {
    this.solution = new Array(length);
  }
}

@Injectable({
  providedIn: 'root'
})
export class CalculationService {

  initialTemperature = new EventEmitter<number>();
  finalTemperature = new EventEmitter<number>();
  alpha = new EventEmitter<number>();
  cityCount = new EventEmitter<number>();
  cities = 0;
  isStart = new EventEmitter<boolean>();
  constructor(private timerService: TimerService) { }

  initializeValues(initialTemperature: number, finalTemperature: number, alpha: number, cityCount: number) {
    this.initialTemperature.emit(initialTemperature);
    this.finalTemperature.emit(finalTemperature);
    this.alpha.emit(alpha);
    this.cityCount.emit(cityCount);
    this.cities = cityCount;
  }

  startCalculation() {
    this.isStart.emit(true);
  }
}
