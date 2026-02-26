/*
Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
MIT License - See LICENSE file in the root directory
Andres Gamboa, Boris Pedraza, Alex Villazon, Omar Ormachea
*/

import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-timeline-chart',
  templateUrl: './timeline-chart.component.html',
  styleUrls: ['./timeline-chart.component.css']
})
export class TimelineChartComponent implements OnInit {
  @Input() data: any[] = [];  
  @Input() headers: any[] = [];  
  public graph: any;

  ngOnInit(): void {
    this.generateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['headers']) {
      this.headers = [...(this.headers || ['X-Axis', 'Y-Axis'])];  // Clonar para forzar la detección de cambios
      this.generateChart();
    }
  }
  

  generateChart(): void {
    const xTitle = this.headers?.[0] || 'X-Axis';  
    const yTitle = this.headers?.[1] || 'Y-Axis';
  
    const dataSeries = this.transformData(this.data);
  
    this.graph = {
      data: dataSeries.map(series => ({
        x: series.values.x, 
        y: series.values.y, 
        type: 'scatter',
        mode: 'lines+markers',
        name: series.name,
      })),
      layout: {
        autosize: true,
        showlegend: false,
        height: 300,
        width: 300,
        xaxis: { title: xTitle },
        yaxis: { title: yTitle },
        margin: {
          l: 0,
          r: 0,
          b: 0,
          t: 0
        },
      }
    };
  }
  


  transformData(data: any[]): { name: string; values: { x: any[]; y: any[] } }[] {
    
    const xValues = data.map(item => item[0]);
    const yValues = data.map(item => item[1]);

    return [{
      name: 'Serie 1',  
      values: {
        x: xValues,
        y: yValues,
      },
    }];
  }
}