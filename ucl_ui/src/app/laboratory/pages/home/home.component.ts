import { Component, OnInit, OnDestroy  } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import * as data from '../../../mockdata.json'
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) { 
  }

  labId: any
  allData: any = (data as any).default;
  labinfo:any
  breakpoint: any
  breakpointParameter: any

  ngAfterViewInit() {
  }

  ngOnInit(): void {

    this.labId = this.route.snapshot.params['id'];
    if(this.labId){
      this.loadLabInfo();
    }
    this.breakpoint = (window.innerWidth <= 580) ? 2 : 1;
  }

  onResize(event : any):void {
    this.breakpoint = (window.innerWidth <= 580) ? 2 : 1;
}

loadLabInfo():void{
  let labIndex = this.allData.map((lab: { id: any; }) => lab.id).indexOf(this.labId);
  if(labIndex >= 0){
    this.labinfo = this.allData[labIndex]
  }else {
    this.toastr.error(`Laboratory Not Found, Try Again`);
    this.router.navigateByUrl('');
  }
}
   

  ngOnDestroy(): void {
  }

  goToRemoteLab(): void {
    this.router.navigateByUrl('/laboratory/'+this.labId);
  }
}
