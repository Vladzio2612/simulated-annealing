import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  randomInt(n) {
    return Math.floor(Math.random() * (n));
  }

  randomInteger(a, b) {
    return Math.floor(Math.random() * (b - a) + a);
  }

  getAcceptanceProbability(currentCost, neighborCost, initialTemperature: number) {
    if (neighborCost < currentCost) {
      return 1;
    }
    return Math.exp((currentCost - neighborCost) / initialTemperature);
  }

  getDistance(p1, p2) {
    const delX = p1[0] - p2[0];
    const delY = p1[1] - p2[1];
    return Math.sqrt((delX * delX) + (delY * delY));
  }

  getCost(route, cities: number) {
    let cost = 0;
    for (let i = 0; i < cities - 1; i++) {
      cost = cost + this.getDistance(route[i], route[i + 1]);
    }
    cost = cost + this.getDistance(route[0], route[cities - 1]);
    return cost;
  }

  linearFunction(temp: number, finalTemperature: number, iteration: number): number {
    return Math.max(temp - 0.1 * iteration, finalTemperature);
  }

  exponentialFunction(temp: number, alpha: number): number {
    return alpha * temp;
  }

  inverseFunction(temp: number): number {
    return temp / (1 + 0.001 * temp);
  }

  logarithmicFunction(iteration: number): number {
    return 100 / Math.log(iteration + 1);
  }
}
