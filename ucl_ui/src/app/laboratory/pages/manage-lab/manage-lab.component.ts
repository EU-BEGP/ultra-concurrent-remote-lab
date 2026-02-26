/*
Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
MIT License - See LICENSE file in the root directory
Andres Gamboa, Boris Pedraza, Alex Villazon, Omar Ormachea
*/

import { Component, OnInit, ViewChild } from '@angular/core';
import { LaboratoryService } from '../../services/laboratory.service';
import { SessionService } from '../../services/session.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { Laboratory } from '../../interfaces/laboratory';
import { Session } from '../../interfaces/session';
import { MatTableDataSource } from '@angular/material/table';
import { catchError, forkJoin, map, of } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { User } from 'src/app/core/auth/interfaces/user';

@Component({
  selector: 'app-manage-lab',
  templateUrl: './manage-lab.component.html',
  styleUrls: ['./manage-lab.component.css']
})
export class ManageLabComponent implements OnInit {

  dataSource!: MatTableDataSource<Session>;
  labId = '';
  laboratory!: Laboratory | undefined
  labSessions: any
  displayedColumnsSessions: string[] = ['name', 'user', 'registration_date', 'registration_time', 'actions'];
  displayedColumnsUsers: string[] = ['name', 'last_name', 'email'];
  breakpoint: any
  no_sessions_data:boolean = false

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;
  paginator_users!: MatPaginator;
  sort_users!: MatSort;
  dataSource_users!: MatTableDataSource<User>;

  constructor( 
    private labService: LaboratoryService,
    private sessionService: SessionService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    
   }
  
  ngOnInit(): void {
    this.breakpoint = (window.innerWidth <= 1100) ? 1 : 2;

    this.route.params.subscribe(params => {
      this.labId = params['id']; // Obtener el nuevo ID de la URL
      if (this.labId) {
        this.loadLabInfo();
      } else {
        this.laboratory = undefined; // Limpiar datos si no hay ID
      }
    });
  }

  loadLabInfo():void{
    this.labService.getLabById(this.labId).subscribe({
      next: (lab : any) => {
       this.laboratory = lab
       this.loadLabSessions()
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

  loadLabSessions(): void {
      this.sessionService.getSessions().subscribe((response) => {
        if (response.length > 0){
          const observables = response.map((item: any) =>
            this.labService.getLabSessions(item.laboratory).pipe(
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


            const usersOnly = formattedData.map((session: { user: any; }) => session.user);
            this.dataSource_users = new MatTableDataSource(usersOnly);
            this.dataSource_users.paginator = this.paginator_users;
            this.dataSource_users.sort = this.sort_users;
          });
     }
      else{
        this.no_sessions_data = true
      }
    });
    }

  
  loadSession(id: string) {
    this.router.navigate(['session/'+id]);
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
  
    onResize(event : any):void {
      this.breakpoint = (window.innerWidth <= 1100) ? 1 : 2;
    }
  
    applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();
  
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }

}
