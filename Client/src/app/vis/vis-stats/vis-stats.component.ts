import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import ParCoords from "parcoord-es";
import { Http } from '@angular/http';
import { Globals } from 'src/app/globals';

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
    this.generateChart();
  }
  private get pickedDate() {
    return this._pickedDate;
  }

  private chart: any;
  private detailData: any[];

  @Input() resetPCBrush: () => void;
  @Output() resetPCBrushChange = new EventEmitter();

  constructor(private http: Http) { }

  ngOnInit() {
  }

  private async generateChart() {
    var params =
      "?date=" + this.pickedDate +
      "&xMin=" + 0 +
      "&yMin=" + 0 +
      "&xMax=" + 698 +
      "&yMax=" + 638;
    const response = await this.http.get(Globals.config.serverEndPoint + "/dataset/detail" + params).toPromise();
    this.detailData = response.json();

    var keys = Object.keys(this.detailData[0]);
    keys.splice(keys.indexOf("latitude"), 1);
    keys.splice(keys.indexOf("longitude"), 1);
    keys.splice(keys.indexOf("time"), 1);

    var dimensions = {};
    for (const key of keys) {
      dimensions[key] = { "type": "number" }
    }

    this.chart = ParCoords()("div.stats-main-div")
      .data(this.detailData)
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

}
