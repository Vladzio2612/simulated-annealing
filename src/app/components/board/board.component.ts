import {Component, OnDestroy, OnInit} from '@angular/core';
import {CalculationService} from '../../services/calculation.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {ChartService} from '../../services/chart.service';
import {Label} from 'ng2-charts';
import {ChartDataSets} from 'chart.js';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit, OnDestroy {

  initialTemperature = 100;
  finalTemperature = 0;
  coolingRate = 0.8;
  cities = 50;
  currentSolution = [];
  bestSolution = [];
  bestCost = 0;
  areaCanvas;
  canvasContext;
  form: FormGroup;
  sub: Subscription;
  function = '';
  iterationCounter = 0;
  iterationWithoutChanges = 0;
  intervalId;
  labels: Label[] = [];
  chartDataTemperature: ChartDataSets = {
    data: [], label: ''
  };
  startTime: Date;
  endTime: Date;
  processingTime: number;

  constructor(public calculationService: CalculationService, private chartService: ChartService) {

  }

  ngOnInit(): void {
    this.form = new FormGroup({
      temperature: new FormControl(''),
      absZero: new FormControl(''),
      coolRate: new FormControl(''),
      cities: new FormControl('')
    });
    this.sub = this.calculationService.cityCount.subscribe(count => this.cities = count);
    this.sub.add(this.calculationService.initialTemperature.subscribe(temp => this.initialTemperature = temp));
    this.sub.add(this.calculationService.finalTemperature.subscribe(temp => this.finalTemperature = temp));
    this.sub.add(this.calculationService.alpha.subscribe(alpha => this.coolingRate = alpha));
    this.sub.add(this.calculationService.function.subscribe(func => this.function = func));
    this.sub.add(this.calculationService.isStart.subscribe(isStart => {
      if (isStart) {
        this.initSolve();
      }
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  initSolve() {
    this.areaCanvas = document.getElementById('area-canvas');
    this.canvasContext = (this.areaCanvas as HTMLCanvasElement).getContext('2d');
    this.init();
  }

  randomInt(n) {
    return Math.floor(Math.random() * (n));
  }

  randomInteger(a, b) {
    return Math.floor(Math.random() * (b - a) + a);
  }

  deepCopy(array, to) {
    let i = array.length;
    while (i--) {
      to[i] = [array[i][0], array[i][1]];
    }
  }

  getCost(route) {
    let cost = 0;
    for (let i = 0; i < this.cities - 1; i++) {
      cost = cost + this.getDistance(route[i], route[i + 1]);
    }
    cost = cost + this.getDistance(route[0], route[this.cities - 1]);
    return cost;
  }

  getDistance(p1, p2) {
    const delX = p1[0] - p2[0];
    const delY = p1[1] - p2[1];
    return Math.sqrt((delX * delX) + (delY * delY));
  }

  generateCandidate(route, i, j) {
    const neighbor = [];
    this.deepCopy(route, neighbor);
    while (i !== j) {
      const t = neighbor[j];
      neighbor[j] = neighbor[i];
      neighbor[i] = t;

      i = (i + 1) % this.cities;
      if (i === j) {
        break;
      }
      j = (j - 1 + this.cities) % this.cities;
    }
    return neighbor;
  }

  getAcceptanceProbability(currentCost, neighborCost) {
    if (neighborCost < currentCost) {
      return 1;
    }
    return Math.exp((currentCost - neighborCost) / this.initialTemperature);
  }

  init() {
    this.processingTime = null;
    this.startTime = new Date();
    this.chartService.labels.next([]);
    this.chartDataTemperature = {data: [], label: ''};
    this.chartService.data.next(this.chartDataTemperature);
    this.labels = [];
    this.iterationCounter = 0;
    for (let i = 0; i < this.cities; i++) {
      this.currentSolution[i] = [this.randomInteger(10, this.areaCanvas.clientWidth - 10),
        this.randomInteger(10, this.areaCanvas.clientHeight - 10)];
    }

    this.deepCopy(this.currentSolution, this.bestSolution);
    this.bestCost = this.getCost(this.bestSolution);

    this.intervalId = setInterval(() => this.solve(), 0);
  }

  solve() {
    let counter = 100;
    if (this.initialTemperature > this.finalTemperature) {
      counter = 100;
      while (counter--) {
        let currentCost = this.getCost(this.currentSolution);
        let k = this.randomInt(this.cities);
        let l = (k + 1 + this.randomInt(this.cities - 2)) % this.cities;
        if (k > l) {
          const tmp = k;
          k = l;
          l = tmp;
        }
        const candidate = this.generateCandidate(this.currentSolution, k, l);
        const candidateCost = this.getCost(candidate);
        if (Math.random() < this.getAcceptanceProbability(currentCost, candidateCost)) {
          this.deepCopy(candidate, this.currentSolution);
          currentCost = this.getCost(this.currentSolution);
        }

        this.iterationWithoutChanges++;

        if (currentCost < this.bestCost) {
          this.deepCopy(this.currentSolution, this.bestSolution);
          this.bestCost = currentCost;
          this.iterationWithoutChanges = 0;
          this.paint();
        }
      }

      this.labels.push(this.iterationCounter.toString());
      this.iterationCounter++;
      this.chartDataTemperature.data.push(this.initialTemperature);
      this.initialTemperature = this.decreaseTemperature(this.initialTemperature, this.coolingRate, this.iterationCounter);

      if (this.iterationWithoutChanges > 10000) {
        this.finishProcess();
      }
    } else {
      this.finishProcess();
    }
  }

  private finishProcess() {
    clearInterval(this.intervalId);
    this.chartService.labels.next(this.labels);
    this.chartDataTemperature.label = this.function;
    this.chartService.data.next(this.chartDataTemperature);
    this.endTime = new Date();
    this.processingTime = this.endTime.getTime() - this.startTime.getTime();
  }

  private paint() {
    this.canvasContext.clearRect(0, 0, this.areaCanvas.clientWidth, this.areaCanvas.clientHeight);
    // Cities
    for (let i = 0; i < this.cities; i++) {
      this.canvasContext.beginPath();
      this.canvasContext.arc(this.bestSolution[i][0], this.bestSolution[i][1], 4, 0, 2 * Math.PI);
      this.canvasContext.fillStyle = '#00ff08';
      this.canvasContext.strokeStyle = '#00ff08';
      this.canvasContext.closePath();
      this.canvasContext.fill();
      this.canvasContext.lineWidth = 1;
      this.canvasContext.stroke();
    }
    // Links
    this.canvasContext.strokeStyle = '#c2185b';
    this.canvasContext.lineWidth = 2;
    this.canvasContext.moveTo(this.bestSolution[0][0], this.bestSolution[0][1]);
    for (let i = 0; i < this.cities - 1; i++) {
      this.canvasContext.lineTo(this.bestSolution[i + 1][0], this.bestSolution[i + 1][1]);
    }
    this.canvasContext.lineTo(this.bestSolution[0][0], this.bestSolution[0][1]);
    this.canvasContext.stroke();
    this.canvasContext.closePath();
  }

  private decreaseTemperature(temp: number, alpha: number, iteration: number): number {
    switch (this.function) {
      case 'linearFunction':
        return this.linearFunction(temp, alpha, iteration);
      case 'exponentialFunction':
        return this.exponentialFunction(temp, alpha);
      case 'inverseFunction':
        return this.inverseFunction(temp);
      case 'logarithmicFunction':
        return this.logarithmicFunction(iteration);
    }
  }

  private linearFunction(temp: number, alpha: number, iteration: number): number {
    return Math.max(temp - 0.1 * iteration, this.finalTemperature);
  }

  private exponentialFunction(temp: number, alpha: number): number {
    return alpha * temp;
  }

  private inverseFunction(temp: number): number {
    return temp / (1 + 0.001 * temp);
  }

  private logarithmicFunction(iteration: number): number {
    return 100 / Math.log(iteration + 1);
  }
}
