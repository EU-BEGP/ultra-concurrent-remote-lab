import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { MatSort} from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SessionService } from '../../services/session.service';
import { Laboratory } from '../../interfaces/laboratory';
import { User } from 'src/app/core/auth/interfaces/user';
import { UserService } from 'src/app/core/auth/services/user.service';
import { Group } from 'src/app/core/auth/enums/group';
import { LaboratoryService } from '../../services/laboratory.service';
import { catchError, forkJoin, map, of } from 'rxjs';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

export interface LaboratoryData {
  id: string,
  institution: string,
  name: string,
  category: string,
  description: string
}


@Component({
  selector: 'app-sessions-list-dialog',
  templateUrl: './sessions-list-dialog.component.html',
  styleUrls: ['./sessions-list-dialog.component.css']
})
export class SessionsListDialogComponent implements OnInit {

  dataSource!: MatTableDataSource<Laboratory>;
  id = '';
  displayedColumns: string[] = ['laboratory', 'registration_date', 'registration_time', 'actions'];
  breakpoint: any


  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;

  laboratory!:any
  is_instructor:boolean = false
  no_sessions_data:boolean = false

  constructor(private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private sessionService: SessionService,
    private userService: UserService,
    private laboratoryService: LaboratoryService,
   private dialogRef: MatDialog,
   private thisDialogRef: MatDialogRef<SessionsListDialogComponent>)
    {
    }

  ngOnInit(): void {
    this.breakpoint = (window.innerWidth <= 1100) ? 1 : 2;
    this.validateInstructor()
  }

  ngAfterViewInit() {
    this.getMySessions()
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

  getMySessions(): void {
    this.sessionService.getSessions().subscribe((response) => {
      if (response.length > 0){
        const observables = response.map((item: any) =>
          this.laboratoryService.getLabById(item.laboratory).pipe(
            map((lab: any) => ({
              ...item,
              registration_date: this.formatDate(item.registration_date),
              registration_time: this.formatTime(item.registration_date),
              laboratory: lab.name
            })),
            catchError(() => {
              // En caso de error, asignar un valor predeterminado
              return of({
                ...item,
                registration_time: this.formatTime(item.registration_date),
                registration_date: this.formatDate(item.registration_date),
                laboratory: 'Unknown'
              });
            })
          )
        );
        forkJoin(observables).subscribe((formattedData : any) => {
          this.dataSource = new MatTableDataSource(formattedData);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
   }
    else{
      this.no_sessions_data = true
    }
  });
  }

  
  formatDate(date: string): string {
    const parsedDate = new Date(date);
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0'); // Meses de 0-11
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const year = parsedDate.getFullYear();
    return `${month}-${day}-${year}`;
  }

  private formatTime(date: string): string {
    const parsedDate = new Date(date);
    const hours = String(parsedDate.getHours()).padStart(2, '0');
    const minutes = String(parsedDate.getMinutes()).padStart(2, '0');
    const seconds = String(parsedDate.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }


  getLaboratoryName(labId: string): string | void {
    this.laboratoryService.getLabById(labId).subscribe({
      next: (lab : any) => {
       return lab.name
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
    


  redirectTo(id: string) {
    this.router.navigate(['session/'+id]);
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


   openConfirmationDialog(id:string, name:string) {
      const dialogRef = this.dialogRef.open(ConfirmationDialogComponent, {
        width: '40vw',
        data: { 
          message: `Please confirm that you want to delete the Session. The data will be lost forever.` 
        }
      });
      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result) { 
         this.deleteSession(id)
         this.thisDialogRef.close(true)
  
         const currentUrl = this.router.url;
  
         // Verificar si la URL actual es la del laboratorio eliminado
         if (currentUrl.includes(id)) {
           this.router.navigateByUrl('/ultra-concurrent-rl'); 
         }
         
        }
      });
    }

    deleteSession(id:string){

      this.sessionService.deleteSession(id).subscribe({
        next: (_: any) => {
          this.toastr.success(
            'Session Deleted'
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
  

}
