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

  selectedValue: string;
  sub: Subscription;
  private alpha: number;
  private initialTemperature: number;
  private finalTemperature: number;
  private count: number;
  form: FormGroup;
  functionList: Map<string, string> = new Map([
    ['Лінійна', 'linearFunction'],
    ['Експоненційна', 'exponentialFunction']
  ]);

  constructor(private calculationService: CalculationService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      function: new FormControl('', [Validators.required]),
      figureCount: new FormControl('', [Validators.required,
        Validators.min(4), Validators.max(1500)]),
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
    this.initialTemperature = this.form.get('initialTemperature').value;
    this.finalTemperature = this.form.get('finalTemperature').value;
    this.alpha = this.form.get('coefficient').value;
    this.count = this.form.get('figureCount').value;
    this.calculationService.initializeValues(this.initialTemperature, this.finalTemperature, this.alpha, this.count, this.form.get('function').value);
    this.calculationService.startCalculation();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
