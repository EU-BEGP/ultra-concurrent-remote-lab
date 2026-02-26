/*
Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
MIT License - See LICENSE file in the root directory
Andres Gamboa, Boris Pedraza, Alex Villazon, Omar Ormachea
*/

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-upload-options-dialog',
  templateUrl: './upload-options-dialog.component.html',
  styleUrls: ['./upload-options-dialog.component.css']
})
export class UploadOptionsDialogComponent implements OnInit {

  numberOfOptions : number = 2
   breakpoint: any
   showYouTubeInput: boolean = false;
    youtubeUrl: string = '';

   @Output() selectedOption = new EventEmitter<any>(); // Emit data changes
 
   constructor(private dialogRef: MatDialogRef<UploadOptionsDialogComponent>,  private toastr: ToastrService,) { }
 
   ngOnInit(): void {
     this.breakpoint = Math.min(Math.floor((window.innerWidth * 0.5) / 260), this.numberOfOptions);
   }
 
   onResize(event : any):void {
     this.breakpoint =Math.min( Math.floor((window.innerWidth * 0.5) / 260), this.numberOfOptions);
   }

   onSelectOption(type: string) {
    if (type === 'Youtube') {
      this.showYouTubeInput = true; // Mostrar input en vez de cerrar
    } else {
      this.selectedOption.emit({ type });
      this.dialogRef.close();
    }
  }

  confirmYouTubeUrl() {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)([\w-]{11})/;
    if (this.youtubeUrl.trim() && youtubeRegex.test(this.youtubeUrl.trim())) {
      this.selectedOption.emit({ type: 'Youtube', url: this.youtubeUrl.trim() });
      this.dialogRef.close();
    }else{
      this.toastr.error('Enter a Valid Youtube URL');
    }
  }

}
