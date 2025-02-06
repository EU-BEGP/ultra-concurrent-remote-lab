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
  @Input() read_only: boolean = false; // Default value is false

  availableFunctions = [
    '=SUM(A1:An)',
    '=AVERAGE(A1:An)',
    '=COUNT(A1:An)',
    '=MAX(A1:An)',
    '=MIN(A1:An)',
    '=IF(Condition,"TRUE","FALSE")',
    '=RAND()'
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
    },*/
    afterGetColHeader: (col: any, TH: {
      style: any; classList: { add: (arg0: string) => void; }; 
}) => {
      if (TH) {
        TH.classList.add('header3');
        TH.style.backgroundColor = '#ffffff'
        TH.classList.add('htMiddle');
        TH.style.fontWeight = "bold"
        
        TH.style.border= "0px"
        TH.style.borderBottom= "3px solid currentColor"
      }
    },
    afterGetRowHeader: (row: any, TH: {
      style: any; classList: { add: (arg0: string) => void; }; 
}) => {
      if (TH) {
        TH.classList.add('header3');
        TH.style.backgroundColor = '#ffffff'
        TH.classList.add('htMiddle');
        
        TH.style.fontWeight = "bold"
        TH.style.border= "0px"
        TH.style.borderRight= "3px solid currentColor"
      }
    },
  };

  constructor() { }

  emitDataChange() {
    this.dataChange.emit(this.data);
  }

}
