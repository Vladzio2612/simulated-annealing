import {Component, OnDestroy, OnInit} from '@angular/core';
import {CalculationService} from '../../services/calculation.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {ChartService} from '../../services/chart.service';
import {Label} from 'ng2-charts';
import {ChartDataSets} from 'chart.js';
import {UtilsService} from '../../services/utils.service';
import {ResultService} from '../../services/result.service';

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
  isUploadedGraph = false;
  uploadedGraph = [];
  isUseFile = false;
  isGeneratedGraph = false;
  isCustom = false;

  constructor(public calculationService: CalculationService,
              private chartService: ChartService,
              private utilsService: UtilsService,
              private resultService: ResultService) {

  }

  ngOnInit(): void {
    this.form = new FormGroup({
      temperature: new FormControl(''),
      absZero: new FormControl(''),
      coolRate: new FormControl(''),
      cities: new FormControl('')
    });
    this.sub = this.calculationService.cityCount$.subscribe(count => {
      if (!this.isUseFile) {
        this.cities = count;
      }
    });
    this.sub.add(this.calculationService.isCustom$.subscribe(isCustom => this.isCustom = isCustom));
    this.sub.add(this.calculationService.isUseFile$.subscribe(isUseFile => this.isUseFile = isUseFile));
    this.sub.add(this.calculationService.initialTemperature$.subscribe(temp => this.initialTemperature = temp));
    this.sub.add(this.calculationService.finalTemperature$.subscribe(temp => this.finalTemperature = temp));
    this.sub.add(this.calculationService.alpha$.subscribe(alpha => this.coolingRate = alpha));
    this.sub.add(this.calculationService.function$.subscribe(func => this.function = func));
    this.sub.add(this.calculationService.isStart$.subscribe(isStart => this.initSolve()));
    this.sub.add(this.calculationService.preloadedGraph$.subscribe((graph: []) => {
      this.isCustom = true;
      this.setGraph(graph);
    }));
    this.sub.add(this.calculationService.resetGraph$.subscribe(() => this.resetGraph()));
    this.sub.add(this.calculationService.generate$.subscribe((cities: number) => {
      this.cities = cities;
      this.isGeneratedGraph = true;
      this.isCustom = true;
      this.generateGraph();
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  initSolve() {
    if (!this.areaCanvas && !this.canvasContext) {
      this.areaCanvas = document.getElementById('area-canvas');
      this.canvasContext = (this.areaCanvas as HTMLCanvasElement).getContext('2d');
    }

    this.init();
  }

  init() {
    clearInterval(this.intervalId);
    this.processingTime = null;
    this.startTime = new Date();
    this.chartService.labels.next([]);
    this.chartDataTemperature = {data: [], label: ''};
    this.chartService.data.next(this.chartDataTemperature);
    this.labels = [];
    this.iterationCounter = 0;

    if (!this.isCustom) {
      this.generateInitialSolution();
    }

    this.bestCost = this.utilsService.getCost(this.bestSolution, this.cities);

    this.intervalId = setInterval(() => this.solve(), 0);
  }

  private generateInitialSolution() {
    for (let i = 0; i < this.cities; i++) {
      this.currentSolution[i] = [this.utilsService.randomInteger(10, this.areaCanvas.clientWidth - 10),
        this.utilsService.randomInteger(10, this.areaCanvas.clientHeight - 10)];
    }
    this.bestSolution = [...this.currentSolution];
  }

  private solve() {
    let counter = 100;
    if (this.initialTemperature > this.finalTemperature) {
      counter = 100;
      while (counter--) {
        let currentCost = this.utilsService.getCost(this.currentSolution, this.cities);
        let k = this.utilsService.randomInt(this.cities);
        let l = (k + 1 + this.utilsService.randomInt(this.cities - 2)) % this.cities;
        if (k > l) {
          const tmp = k;
          k = l;
          l = tmp;
        }
        const candidate = this.generateCandidate(this.currentSolution, k, l);
        const candidateCost = this.utilsService.getCost(candidate, this.cities);
        if (Math.random() < this.utilsService.getAcceptanceProbability(currentCost, candidateCost, this.initialTemperature)) {
          this.currentSolution = [...candidate];
          currentCost = this.utilsService.getCost(this.currentSolution, this.cities);
        }

        this.iterationWithoutChanges++;

        if (currentCost < this.bestCost) {
          this.bestSolution = [...this.currentSolution];
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

  private generateCandidate(route: any, i, j) {
    const neighbor = [...route];
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

  generateGraph() {
    this.areaCanvas = document.getElementById('area-canvas');
    this.canvasContext = (this.areaCanvas as HTMLCanvasElement).getContext('2d');
    this.generateInitialSolution();
    this.uploadedGraph = [...this.currentSolution];
    this.paint();
    this.isGeneratedGraph = true;
    this.isUploadedGraph = true;
  }

  private setGraph(graph: []) {
    this.cities = graph.length;
    this.uploadedGraph = graph;
    this.currentSolution = [...this.uploadedGraph];
    this.bestSolution = [...this.currentSolution];
    this.areaCanvas = document.getElementById('area-canvas');
    this.canvasContext = (this.areaCanvas as HTMLCanvasElement).getContext('2d');
    this.paint();
    this.isUploadedGraph = true;
  }

  private resetGraph() {
    if ((this.isUploadedGraph && this.isUseFile) || this.isGeneratedGraph) {
      this.currentSolution = [...this.uploadedGraph];
      this.bestSolution = [...this.currentSolution];
      this.paint();
    }
  }

  private finishProcess() {
    clearInterval(this.intervalId);
    this.chartService.labels.next(this.labels);
    this.chartDataTemperature.label = this.function;
    this.chartService.data.next(this.chartDataTemperature);
    this.endTime = new Date();
    this.processingTime = this.endTime.getTime() - this.startTime.getTime();
    this.resultService.results.emit({ method: this.function, time: this.processingTime,
      iterations: this.iterationCounter * 100, cityCount: this.cities, distance: Math.round(this.bestCost) });
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
        return this.utilsService.linearFunction(temp, this.finalTemperature, iteration);
      case 'exponentialFunction':
        return this.utilsService.exponentialFunction(temp, alpha);
      case 'inverseFunction':
        return this.utilsService.inverseFunction(temp);
      case 'logarithmicFunction':
        return this.utilsService.logarithmicFunction(iteration);
    }
  }
}
