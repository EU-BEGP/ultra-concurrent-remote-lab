import { Component, OnInit, Input, Output, EventEmitter  } from '@angular/core';
import HyperFormula from 'hyperformula';



@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.css']
})


export class DynamicTableComponent implements OnInit {

  @Output() dataChange = new EventEmitter<any>(); // Emit data changes
  @Input() data: any;


  hyperformulaInstance = HyperFormula.buildEmpty({
    licenseKey: 'internal-use-in-handsontable',
  });
  
  tableConfig = {
   
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
  

  ngOnInit(): void {
  }


  emitDataChange() {
    this.dataChange.emit(this.data);
  }

}
