import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import ParCoords from "parcoord-es";
import { Http } from '@angular/http';
import { Globals } from 'src/app/globals';
import * as d3 from 'd3';
import { generate } from 'rxjs';

@Component({
  selector: 'app-vis-stats',
  templateUrl: './vis-stats.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './vis-stats.component.scss',
    '../../../../node_modules/parcoord-es/dist/parcoords.css'
  ]
})
export class VisStatsComponent implements OnInit {

  private _pickedDate: string;
  @Input() private set pickedDate(value: string) {
    this._pickedDate = value;
    this.updateChart(value);
  }
  private get pickedDate() {
    return this._pickedDate;
  }

  private chart: any;
  private chartData: any[];

  @Input() resetPCBrush: () => void;
  @Output() resetPCBrushChange = new EventEmitter();

  @Input() updateChart: (date: string, xMin?: number, yMin?: number, xMax?: number, yMax?: number) => void;
  @Output() updateChartChange = new EventEmitter();

  constructor(private http: Http) { }

  ngOnInit() {
    this.updateChart = async (date: string, xMin = 0, yMin = 0, xMax = 698, yMax = 638) => {
      this.chartData = await this.obtainChartData(date, xMin, yMin, xMax, yMax);
      this.generateChart();
    };
    this.updateChartChange.emit(this.updateChart);
  }

  private generateChart() {
    var keys = Object.keys(this.chartData[0]);
    keys.splice(keys.indexOf("latitude"), 1);
    keys.splice(keys.indexOf("longitude"), 1);
    keys.splice(keys.indexOf("time"), 1);

    var dimensions = {};
    for (const key of keys) {
      dimensions[key] = { "type": "number" }
    }

    d3.selectAll("div.stats-main-div").selectAll("*").remove();

    this.chart = ParCoords()("div.stats-main-div")
      .data(this.chartData)
      .dimensions(dimensions)
      .margin({
        top: 20,
        left: 20,
        right: 20,
        bottom: 20
      })
      .color("rgba(100,100,200,0.3)")
      .mode("queue")
      .render()
      .createAxes()
      .reorderable()
      .brushMode("1D-axes");

    this.resetPCBrushChange.emit(
      () => this.chart.brushReset()
    );
  }


  private async obtainChartData(date: string, xMin: number, yMin: number, xMax: number, yMax: number) {
    var params = "?date=" + date +
      "&xMin=" + xMin +
      "&yMin=" + yMin +
      "&xMax=" + xMax +
      "&yMax=" + yMax;
    const response = await this.http.get(Globals.config.serverEndPoint + "/dataset/detail" + params).toPromise();
    return response.json();
  }
}
