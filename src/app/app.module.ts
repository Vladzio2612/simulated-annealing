import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatSliderModule} from '@angular/material/slider';
import {MatButtonModule} from '@angular/material/button';
import {MatTabsModule} from '@angular/material/tabs';
import {ChartsModule} from 'ng2-charts';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatTableModule} from '@angular/material/table';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SideBarComponent} from './components/side-bar/side-bar.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BoardComponent} from './components/board/board.component';
import {LineChartComponent} from './components/line-chart/line-chart.component';
import { ResultsComponent } from './components/results/results.component';
import { ResultTableComponent } from './components/result-table/result-table.component';
import {NgxChartsModule} from '@swimlane/ngx-charts';


@NgModule({
  declarations: [
    AppComponent,
    SideBarComponent,
    BoardComponent,
    LineChartComponent,
    ResultsComponent,
    ResultTableComponent
  ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MatSidenavModule,
        MatSelectModule,
        MatInputModule,
        FormsModule,
        MatSliderModule,
        MatButtonModule,
        ReactiveFormsModule,
        MatTabsModule,
        ChartsModule,
        MatSlideToggleModule,
        MatTooltipModule,
        MatTableModule,
        NgxChartsModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
