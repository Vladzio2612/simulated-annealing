import {EventEmitter, Injectable} from '@angular/core';
import {Result} from '../components/result-table/result-table.component';

@Injectable({
  providedIn: 'root'
})
export class ResultService {

  results = new EventEmitter<Result>();

  constructor() { }
}
