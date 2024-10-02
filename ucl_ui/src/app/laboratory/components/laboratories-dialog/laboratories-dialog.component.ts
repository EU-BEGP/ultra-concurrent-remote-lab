import { AfterViewInit, Component, ViewChild } from '@angular/core';
import * as data from '../../../mockdata.json'
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { MatSort} from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

export interface LaboratoryData {
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
export class LaboratoriesDialogComponent implements AfterViewInit {

  allData: any = (data as any).default;
  dataSource: MatTableDataSource<LaboratoryData>;
  id = '';
  labinfo:any
  displayedColumns: string[] = ['name', 'institution', 'category', 'actions'];
  breakpoint: any


  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;

  constructor(private http: HttpClient, private toastr: ToastrService, private router: Router) {
    this.dataSource = new MatTableDataSource(this.allData.map(function(laboratory:any) {return laboratory.info;}));
   }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.breakpoint = (window.innerWidth <= 1100) ? 1 : 2;
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
