import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CalculationService} from '../../services/calculation.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit, OnDestroy {

  sub: Subscription;
  private alpha: number;
  private initialTemperature: number;
  private finalTemperature: number;
  private count: number;
  form: FormGroup;
  functionList: Map<string, string> = new Map([
    ['Лінійна', 'linearFunction'],
    ['Експоненційна', 'exponentialFunction'],
    ['Зворотня', 'inverseFunction'],
    ['Логарифмічна', 'logarithmicFunction']
  ]);
  uploadedFile: File;
  fileString: string;
  uploadedGraph = [];
  isUseFile = false;
  isGenerate = false;
  isEnableStart = true;

  constructor(private calculationService: CalculationService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      function: new FormControl('', [Validators.required]),
      cities: new FormControl('', [Validators.min(4), Validators.max(1500)]),
      initialTemperature: new FormControl('', [Validators.required,
        Validators.min(0), Validators.max(1500)]),
      finalTemperature: new FormControl(null, [Validators.required,
        Validators.min(0), Validators.max(1500)]),
      coefficient: new FormControl({value: null, disabled: true}),
      slider: new FormControl(null, [Validators.required])
    });

    this.sub = this.form.get('slider').valueChanges
      .subscribe(value => this.form.get('coefficient').patchValue(value));
  }

  startCalculation() {
    if (!this.isGenerate && !this.isUseFile) {
      this.calculationService.isCustom$.emit(false);
    }
    this.initialTemperature = this.form.get('initialTemperature').value;
    this.finalTemperature = this.form.get('finalTemperature').value;
    this.alpha = this.form.get('coefficient').value;
    this.count = this.form.get('cities').value;
    this.calculationService.isUseFile$.emit(this.isUseFile);
    this.calculationService.initializeValues(this.initialTemperature, this.finalTemperature, this.alpha, this.count,
      this.form.get('function').value);
    this.calculationService.startCalculation();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  processFile(event) {
    this.uploadedFile = event.target.files[0];

    const reader = new FileReader();
    reader.readAsText(this.uploadedFile);
    reader.onloadend = (e) => {
      this.fileString = reader.result as string;
      const strings = this.fileString.split('|');
      for (let i = 0; i < strings.length; i++) {
        this.uploadedGraph[i] = strings[i].split(',').map(value => Number.parseFloat(value));
      }
      this.calculationService.preloadGraph(this.uploadedGraph);
      event.target.value = null;
    };
  }

  resetUploadedGraph() {
    this.calculationService.isUseFile$.emit(this.isUseFile);
    this.calculationService.resetGraph$.next();
  }

  generateGraph() {
    this.count = this.form.get('cities').value;
    this.calculationService.generate$.emit(this.count);
  }

  isGenerateToggle() {
    this.isGenerate = !this.isGenerate;
    this.isUseFile = false;
  }

  isUseFileToggle() {
    this.isUseFile = !this.isUseFile;
    this.isGenerate = false;
  }
}
