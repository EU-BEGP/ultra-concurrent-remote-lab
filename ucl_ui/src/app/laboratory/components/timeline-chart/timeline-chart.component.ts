import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-timeline-chart',
  templateUrl: './timeline-chart.component.html',
  styleUrls: ['./timeline-chart.component.css']
})
export class TimelineChartComponent implements OnInit {
  @Input() data: any[] = [];  // Aquí recibirás el array de arrays
  public graph: any;

  ngOnInit(): void {
    this.generateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.generateChart();  // Regeneramos el gráfico cuando los datos cambian
    }
  }

  generateChart(): void {
    // Transformar el array de arrays en el formato esperado para el gráfico
    const dataSeries = this.transformData(this.data);
    this.graph = {
      data: dataSeries.map(series => ({
        x: series.values.x, // Fechas o tiempo en X
        y: series.values.y, // Valores en Y
        type: 'scatter', // Tipo de gráfico
        mode: 'lines+markers', // Líneas con marcadores
        name: series.name, // Nombre de la serie
      })),
      layout: {
        autosize: true,
        showlegend: false,
        height: 300,
        width: 300,
        xaxis: { title: 'A' },
        yaxis: { title: 'B' },
        margin: {
          l: 0,
          r: 0,
          b: 0,
          t: 0
        },
      }
    };
  }

  // Función que transforma el array de arrays en el formato adecuado
  transformData(data: any[]): { name: string; values: { x: any[]; y: any[] } }[] {
    // Asumimos que solo hay una serie de datos para simplificar
    const xValues = data.map(item => item[0]);
    const yValues = data.map(item => item[1]);

    return [{
      name: 'Serie 1',  // Nombre de la serie
      values: {
        x: xValues,
        y: yValues,
      },
    }];
  }
}