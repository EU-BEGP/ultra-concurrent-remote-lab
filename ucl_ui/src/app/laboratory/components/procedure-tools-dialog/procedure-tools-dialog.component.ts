import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import {MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-procedure-tools-dialog',
  templateUrl: './procedure-tools-dialog.component.html',
  styleUrls: ['./procedure-tools-dialog.component.css']
})
export class ProcedureToolsDialogComponent implements OnInit {

  numberOfOptions : number = 2
  breakpoint: any
  @Output() selectedOption = new EventEmitter<any>(); // Emit data changes

  constructor(private dialogRef: MatDialogRef<ProcedureToolsDialogComponent>) { }

  ngOnInit(): void {
    this.breakpoint = Math.min(Math.floor((window.innerWidth * 0.5) / 260), this.numberOfOptions);
  }

  onResize(event : any):void {
    this.breakpoint =Math.min( Math.floor((window.innerWidth * 0.5) / 260), this.numberOfOptions);
  }

  onAddProcedure(type:string) {
    this.selectedOption.emit(type);
    this.dialogRef.close(); 
  }
}

