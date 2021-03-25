import {EventEmitter, Injectable} from '@angular/core';

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
  function = new EventEmitter<string>();

  constructor() {}

  initializeValues(initialTemperature: number, finalTemperature: number, alpha: number, cityCount: number, func: string) {
    this.initialTemperature.emit(initialTemperature);
    this.finalTemperature.emit(finalTemperature);
    this.alpha.emit(alpha);
    this.cityCount.emit(cityCount);
    this.cities = cityCount;
    this.function.emit(func);
  }

  startCalculation() {
    this.isStart.emit(true);
  }
}
