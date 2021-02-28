import {EventEmitter, Injectable, OnDestroy, OnInit} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimerService implements OnDestroy {

  timer = new EventEmitter<number>();
  counter = 0;
  timerRef: any;
  running: boolean = false;
  startText = 'Start';

  constructor() {
  }

  async startTimer() {
    this.running = !this.running;
    if (this.running) {
      this.counter = 0;
      this.timer.emit(this.counter);
      this.startText = 'Stop';
      const startTime = Date.now() - (this.counter || 0);
      this.timerRef = setInterval(async () => {
        this.timer.emit(++this.counter);
      });
    } else {
      this.startText = 'Resume';
      clearInterval(this.timerRef);
    }
  }

  clearTimer() {
    this.running = false;
    this.startText = 'Start';
    this.counter = undefined;
    this.timer.emit(this.counter);
    clearInterval(this.timerRef);
  }

  ngOnDestroy(): void {
    clearInterval(this.timerRef);
  }
}
