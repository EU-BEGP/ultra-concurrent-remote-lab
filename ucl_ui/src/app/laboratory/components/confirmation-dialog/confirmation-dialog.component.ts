/*
Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
MIT License - See LICENSE file in the root directory
Andres Gamboa, Boris Pedraza, Alex Villazon, Omar Ormachea
*/

import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent implements OnInit {

  message:string;

  constructor(private dialogRef: MatDialogRef<ConfirmationDialogComponent>,  
    private toastr: ToastrService,  
    @Inject(MAT_DIALOG_DATA) public data: { message: string}
  ) {
    this.message = data.message;
  }

  ngOnInit(): void {
  }

  confirm(): void {
    this.dialogRef.close(true); 
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}


