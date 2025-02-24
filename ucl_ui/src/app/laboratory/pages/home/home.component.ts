import { Component, OnInit, OnDestroy  } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LaboratoriesDialogComponent } from '../../components/laboratories-dialog/laboratories-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { LaboratoryService } from '../../services/laboratory.service';
import { Laboratory } from '../../interfaces/laboratory';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private dialogRef: MatDialog,
    private labService: LaboratoryService
  ) { 
  }
  laboratory!: Laboratory | undefined
  labId: any
  breakpoint: any
  breakpointParameter: any

  ngAfterViewInit() {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.labId = params['id']; // Obtener el nuevo ID de la URL
      if (this.labId) {
        this.loadLabInfo();
      } else {
        this.laboratory = undefined; // Limpiar datos si no hay ID
      }
    });
  
    this.breakpoint = (window.innerWidth <= 580) ? 2 : 1;
  }
  

  onResize(event : any):void {
    this.breakpoint = (window.innerWidth <= 580) ? 2 : 1;
}

loadLabInfo():void{
  this.labService.getLabById(this.labId).subscribe({
    next: (lab : any) => {
     this.laboratory = lab
    },
    error: (e: any) => {
      console.log(e)
      this.toastr.error(
        'There was an error getting the Laboratory. Please try again later.'
      );
      this.router.navigateByUrl('');
    },
  });

}
   

  ngOnDestroy(): void {
  }

  goToRemoteLab(): void {
    if(this.labId){
      this.router.navigateByUrl('/laboratory/'+this.labId);
    }
  }

  createRemoteLab(): void {
    this.router.navigateByUrl('/create-lab');
  }

  openLaboratories(){
    const dialogRef = this.dialogRef.open(LaboratoriesDialogComponent, {
      width: '75vw'
     })
     dialogRef.afterClosed().subscribe((res: any) => {
     })
  }
}
