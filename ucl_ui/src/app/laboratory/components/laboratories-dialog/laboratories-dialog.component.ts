import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { MatSort} from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { LaboratoryService } from 'src/app/laboratory/services/laboratory.service';
import { Laboratory } from '../../interfaces/laboratory';

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
  id = '';
  labinfo:any
  displayedColumns: string[] = ['name', 'institution', 'category', 'actions'];
  breakpoint: any


  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;

  constructor(private http: HttpClient, private toastr: ToastrService, private router: Router,  private laboratoryService: LaboratoryService,) {
    this.getLaboratories()
   }
  ngOnInit(): void {
    this.breakpoint = (window.innerWidth <= 1100) ? 1 : 2;
  }

  getLaboratories(): void {
    this.laboratoryService.getLabs().subscribe((response) => {
      this.dataSource = new MatTableDataSource(response);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }


  redirectTo(id: string) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['laboratory/'+id])});
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
