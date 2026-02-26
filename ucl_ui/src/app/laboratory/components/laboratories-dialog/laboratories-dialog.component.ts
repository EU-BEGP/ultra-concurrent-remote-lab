/*
Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
MIT License - See LICENSE file in the root directory
Andres Gamboa, Boris Pedraza, Alex Villazon, Omar Ormachea
*/

import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { MatSort} from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { LaboratoryService } from 'src/app/laboratory/services/laboratory.service';
import { Laboratory } from '../../interfaces/laboratory';
import { User } from 'src/app/core/auth/interfaces/user';
import { UserService } from 'src/app/core/auth/services/user.service';
import { Group } from 'src/app/core/auth/enums/group';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

export interface LaboratoryData {
  id: string,
  institution: string,
  name: string,
  category: string,
  description: string
}


@Component({
  selector: 'app-laboratories-dialog',
  templateUrl: './laboratories-dialog.component.html',
  styleUrls: ['./laboratories-dialog.component.css']
})
export class LaboratoriesDialogComponent implements OnInit {

  dataSource!: MatTableDataSource<Laboratory>;
  dataSource_my_labs!: MatTableDataSource<Laboratory>;
  id = '';
  displayedColumns: string[] = ['name', 'institution', 'category', 'actions'];
  displayedColumns_my_labs: string[] = ['name', 'url', 'actions'];
  breakpoint: any
  


  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;


  
  @ViewChild(MatPaginator)
  paginator_my_labs!: MatPaginator;
  @ViewChild(MatSort)
  sort_my_labs!: MatSort;

  is_instructor:boolean = false
  no_my_labs_data:boolean = false
  no_labs_data:boolean = false

  constructor(private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private laboratoryService: LaboratoryService,
    private userService: UserService,
    private dialogRef: MatDialog,
  private thisDialogRef: MatDialogRef<LaboratoriesDialogComponent>)
    //private clipboard: Clipboard) 
    {
      this.getLaboratories()
      this.getMyLaboratories()
    }

  ngOnInit(): void {
    this.breakpoint = (window.innerWidth <= 1100) ? 1 : 2;

    this.validateInstructor()
  }
    

  validateInstructor(){
    const token = localStorage.getItem('token');

    if (token) {
      this.userService.getUserData().subscribe(
        (user : User) => {
          user.groups!.forEach((group) => {
            if (group.name === Group.Instructors) this.is_instructor = true;
          });
        },
        (err : any) => (this.is_instructor = false)
      );
    } else {
      this.is_instructor = false;
    }
  }

  getLaboratories(): void {
    this.laboratoryService.getLabs(false).subscribe((response) => {
      if (response.length > 0){
      this.dataSource = new MatTableDataSource(response);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

       // Ordenar por 'institution' de forma ascendente al inicio
      this.sort.active = 'institution';
      this.sort.direction = 'desc';
      this.sort.sortChange.emit(); // Notifica que hubo un cambio de orden

   }
    else{
      this.no_labs_data = true
    }
  });
  }

  getMyLaboratories():void{
    this.laboratoryService.getLabs(true).subscribe((response) => {
      if (response.length > 0){
        this.dataSource_my_labs = new MatTableDataSource(response);
        this.dataSource_my_labs.paginator = this.paginator_my_labs;
        this.dataSource_my_labs.sort = this.sort_my_labs;
      } else {
        this.no_my_labs_data = true
      }
    });
  }

  goToCreateLab(){
    this.router.navigateByUrl('/create-lab');
  }

  goToManageLab(id:string){
    this.router.navigateByUrl('/manage-lab/'+id);
  }

  openConfirmationDialog(id:string, name:string) {
    const dialogRef = this.dialogRef.open(ConfirmationDialogComponent, {
      width: '40vw',
      data: { 
        message: `Please confirm that you want to delete the laboratory <b>${name}</b>. The data will be lost forever.` 
      }
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) { 
       this.deleteLab(id)
       this.thisDialogRef.close(true)

       const currentUrl = this.router.url;

       // Verificar si la URL actual es la del laboratorio eliminado
       if (currentUrl.includes(id)) {
         this.router.navigateByUrl('/ultra-concurrent-rl'); 
       }
       
      }
    });
  }

  deleteLab(id:string){

    this.laboratoryService.deleteLab(id).subscribe({
      next: (_: any) => {
        this.toastr.success(
          'Laboratory Deleted'
        );
      },
      error: (e: any) => {
        console.log(e)
        this.toastr.error(
          'There was an error deleting the Lab. Please try later.'
        );
      },
    });
  }

  updateLab(id:string){
    this.toastr.info("Not Implemented yet")
    //this.router.navigate(['create-lab/'+id]);
   }


  redirectTo(id: string) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['laboratory/'+id])});
  }

  copyLink():void{
    this.toastr.success("Link Copied to your Clipboard")
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onResize(event : any):void {
    this.breakpoint = (window.innerWidth <= 1100) ? 1 : 2;
  }
}
