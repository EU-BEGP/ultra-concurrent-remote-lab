/*
Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
MIT License - See LICENSE file in the root directory
Andres Gamboa, Boris Pedraza, Alex Villazon, Omar Ormachea
*/

import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-simple-input-dialog',
  templateUrl: './simple-input-dialog.component.html',
  styleUrls: ['./simple-input-dialog.component.css']
})
export class SimpleInputDialogComponent  implements AfterViewInit  {

  @ViewChild('inputField') inputField!: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<SimpleInputDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; label: string; value: string }
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.inputField.nativeElement.focus();
      this.inputField.nativeElement.select();  // Selecciona el texto automáticamente
    }, 0);
  }
  
  

  onCancel(): void {
    this.dialogRef.close(null);  // Cierra sin cambios
  }

  onSave(): void {
    this.dialogRef.close(this.data.value);  // Devuelve el nuevo valor
  }
}
