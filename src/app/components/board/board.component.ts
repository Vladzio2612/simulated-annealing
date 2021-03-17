import { Component, OnDestroy, OnInit } from '@angular/core';
import { CalculationService } from '../../services/calculation.service';
import { TimerService } from '../../services/timer.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

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
  current = [];
  best = [];
  bestCost = 0;
  areaCanvas;
  canvasContext;
  form: FormGroup;
  sub: Subscription;

  constructor(public calculationService: CalculationService, private timerService: TimerService) {

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
    for (let i = 0; i < this.cities; i++) {
      this.current[i] = [this.randomInteger(10, this.areaCanvas.clientWidth - 10),
        this.randomInteger(10, this.areaCanvas.clientHeight - 10)];
    }

    this.deepCopy(this.current, this.best);
    this.bestCost = this.getCost(this.best);
    const timerId = setInterval(() => { this.solve(); }, 10);
    // setTimeout(() => {
    //   clearInterval(timerId);
    // }, 50000);
  }

  solve() {
    if (this.initialTemperature > this.finalTemperature) {
      let counter = 100;
      while (counter--) {
        let currentCost = this.getCost(this.current);
        let k = this.randomInt(this.cities);
        let l = (k + 1 + this.randomInt(this.cities - 2)) % this.cities;
        if (k > l) {
          const tmp = k;
          k = l;
          l = tmp;
        }
        const candidate = this.generateCandidate(this.current, k, l);
        const candidateCost = this.getCost(candidate);
        if (Math.random() < this.getAcceptanceProbability(currentCost, candidateCost)) {
          this.deepCopy(candidate, this.current);
          currentCost = this.getCost(this.current);
        }
        if (currentCost < this.bestCost) {
          this.deepCopy(this.current, this.best);
          this.bestCost = currentCost;
          this.paint();
        }
      }

      this.initialTemperature *= this.coolingRate;
    }
  }

  paint() {
    this.canvasContext.clearRect(0, 0, this.areaCanvas.clientWidth, this.areaCanvas.clientHeight);
    // Cities
    for (let i = 0; i < this.cities; i++) {
      this.canvasContext.beginPath();
      this.canvasContext.arc(this.best[i][0], this.best[i][1], 4, 0, 2 * Math.PI);
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
    this.canvasContext.moveTo(this.best[0][0], this.best[0][1]);
    for (let i = 0; i < this.cities - 1; i++) {
      this.canvasContext.lineTo(this.best[i + 1][0], this.best[i + 1][1]);
    }
    this.canvasContext.lineTo(this.best[0][0], this.best[0][1]);
    this.canvasContext.stroke();
    this.canvasContext.closePath();
  }

}
