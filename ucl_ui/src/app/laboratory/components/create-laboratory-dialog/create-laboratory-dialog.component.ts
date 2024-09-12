import { Component, OnInit, Inject, inject, HostListener} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-create-laboratory-dialog',
  templateUrl: './create-laboratory-dialog.component.html',
  styleUrls: ['./create-laboratory-dialog.component.css']
})
export class CreateLaboratoryDialogComponent implements OnInit {

  @HostListener('window:keyup.esc') onKeyUp() {
    let cn = confirm('The Data is not Saved, Are you sure you want to Close it?')
      if (cn) {
        this.dialogRef.close();
      }
    }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
        event.returnValue = false;
    }


  constructor( public dialogRef: MatDialogRef<CreateLaboratoryDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) public message: string,) {    
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }

  onNoClick(): void{
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.dialogRef.disableClose = true;
    this.dialogRef.backdropClick().subscribe(_ => {
      let cn = confirm('The Data is not Saved, Are you sure you want to Close it?')
      if (cn) {
        this.dialogRef.close();
      }
    })
  }
}
