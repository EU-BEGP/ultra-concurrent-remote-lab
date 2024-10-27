import { Component, OnInit, Input, Output, EventEmitter  } from '@angular/core';
import HyperFormula from 'hyperformula';
import Handsontable from 'handsontable';



@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.css']
})


export class DynamicTableComponent implements OnInit {

  @Output() dataChange = new EventEmitter<any>(); // Emit data changes
  @Input() data: any;

  availableFunctions = [
    '=SUM',
    '=AVERAGE',
    '=COUNT',
    '=MAX',
    '=MIN',
    '=IF',
  ];

 
  ngOnInit(): void {
   
  }

  @Output() deleteProcedure = new EventEmitter<void>();  // Evento para notificar al componente principal

  onDeleteTable() {
    this.deleteProcedure.emit();  // Emite el evento al componente principal
  }


  hyperformulaInstance = HyperFormula.buildEmpty({
    licenseKey: 'internal-use-in-handsontable',
  });
  
  tableConfig = {
    /*columns: (col: number) => {
      return {
        type: 'autocomplete',
        source: this.availableFunctions,
        strict: false,
        visibleRows: 4,
        trimDropdown: false,
      };
    },
   */
    afterGetColHeader: (col: any, TH: {
      style: any; classList: { add: (arg0: string) => void; }; 
}) => {
      if (TH) {
        TH.classList.add('header3');
        TH.classList.add('column-header');
        TH.style.backgroundColor = '#ffffff'
      }
    },
    afterGetRowHeader: (row: any, TH: {
      style: any; classList: { add: (arg0: string) => void; }; 
}) => {
      if (TH) {
        TH.classList.add('header3');
        TH.classList.add('row-header');
        TH.style.backgroundColor = '#ffffff'
      }
    },
  };

  constructor() { }

  emitDataChange() {
    this.dataChange.emit(this.data);
  }

}
