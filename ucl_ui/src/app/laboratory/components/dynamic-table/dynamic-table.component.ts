import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef  } from '@angular/core';
import HyperFormula from 'hyperformula';
import Handsontable from 'handsontable';
import { DetailedSettings } from 'handsontable/plugins/contextMenu';
import { SimpleInputDialogComponent } from '../simple-input-dialog/simple-input-dialog.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.css']
})


export class DynamicTableComponent implements OnInit {

  @Output() dataChange = new EventEmitter<any>(); 
  @Input() data: any = Handsontable.helper.createSpreadsheetData(5, 2);
  @Input() headers: any = ['C 1', 'C 2']
  @Input() read_only: boolean = false; 
  @ViewChild('hotTable', { static: false }) hotTable!: ElementRef;
  hotInstance!: Handsontable;  
  
  availableFunctions = [
    '=SUM(A1:An)',
    '=AVERAGE(A1:An)',
    '=COUNT(A1:An)',
    '=MAX(A1:An)',
    '=MIN(A1:An)',
    '=IF(Condition,"TRUE","FALSE")',
    '=RAND()'
  ];

  @Output() deleteProcedure = new EventEmitter<void>();  

  constructor( private dialog: MatDialog ) { }
  
  ngOnInit(): void {
  
  }

  ngAfterViewInit(): void {
    if (this.hotTable) {
      if (this.hotInstance) {
        this.hotInstance.destroy();
      }
      
      
      this.tableConfig.data = this.data; // Asegurar que use los datos correctos
      this.tableConfig.colHeaders = (col: number) => this.headers[col] || `C ${col + 1}`;
  
      this.hotInstance = new Handsontable(this.hotTable.nativeElement, this.tableConfig);
    }
  }
  

  hyperformulaInstance = HyperFormula.buildEmpty({
    licenseKey: 'internal-use-in-handsontable',
  });

  dropDownMenuSettings: DetailedSettings = {

    items: {
      col_left: {
        name: 'Insert column left',
      },
      col_right: {
        name: 'Insert column right', 
      },  
      rename_column: {
        name: 'Rename Column',
        callback: (key, selection) => {
          const colIndex = selection[0].end.col; 
          this.openRenameDialog(colIndex);
        },
      },
      
      clear_column: {
        name: 'Clear column',
      },
      remove_col: {
        name: 'Remove column', 
      },
      credits: {
        renderer() {
          const elem = document.createElement('marquee');

          elem.style.cssText = 'background: lightgray;';
          elem.textContent = 'Brought to you by UPB';

          return elem;
        },
        disableSelection: true, 
        isCommand: false,
      },
    },
  };


  
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
    stretchH: "all" as "all",
    contextMenu: this.read_only 
    ? false 
    : { 
        items: {
          row_above: {},
          row_below: {},
          remove_row: {},
        }
      },
    className:"custom-table htCenter htMiddle body1",
    width:"100%",
    height: "auto",
    rowHeights:"40px",
    data: this.data,
    colHeaders: (col: number) => this.headers[col] || `C ${col + 1}`,
    rowHeaders: true,
    manualColumnResize:!this.read_only,
    manualRowMove:!this.read_only,
    dropdownMenu: this.read_only? false : this.dropDownMenuSettings,
    cells: (row: number, col: number) => {
      const cellProperties: any = {};
      if (this.read_only) {
        cellProperties.readOnly = true; 
      }
      return cellProperties;
    },
    afterGetColHeader: (col: any, TH:HTMLElement) => {
      if (TH) {
        TH.classList.add('header3');
        TH.style.height="40px"
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
    afterChange: (changes: any, source: string) => {
      if (source !== 'loadData' && changes) {  
          this.onTableChanged(changes);
      }
  },
    formulas:{ engine: this.hyperformulaInstance },
    licenseKey:"non-commercial-and-evaluation",
  };


  openRenameDialog(colIndex: number) {
    const dialogRef = this.dialog.open(SimpleInputDialogComponent, {
      data: { title: 'Column', label: 'Column Name', value: this.headers[colIndex] },
      disableClose: true, 
      autoFocus: true,    
      width: '300px',     
      backdropClass: 'disable-backdrop-click' 
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.headers[colIndex] = result;
        this.hotInstance.updateSettings({ colHeaders: (col: number) => this.headers[col] || `C ${col + 1}` });
        this.emitDataChange();
      }
    });
    
  }

  emitDataChange() {
    this.dataChange.emit({ data: this.hotInstance.getData(), headers: this.headers });
}

  onTableChanged(event: any) {
    if (!this.read_only) {
      this.emitDataChange();
    }
  }

  onDeleteTable() {
    this.deleteProcedure.emit();  
  }
}
