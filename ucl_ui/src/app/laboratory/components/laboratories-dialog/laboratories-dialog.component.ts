import { Component, OnInit } from '@angular/core';
import * as data from '../../../mockdata.json'
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-laboratories-dialog',
  templateUrl: './laboratories-dialog.component.html',
  styleUrls: ['./laboratories-dialog.component.css']
})
export class LaboratoriesDialogComponent implements OnInit {

  allData: any = (data as any).default;
  id = '';
  labinfo:any
  displayedColumns: string[] = ['name', 'institution', 'category', 'actions'];


  constructor(private route: ActivatedRoute, private http: HttpClient, private toastr: ToastrService, private router: Router) { }

  ngOnInit(): void {
  }

  redirectTo(id: string) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['laboratory/'+id])});
  }
}
