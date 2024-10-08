import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {BreakpointObserver} from '@angular/cdk/layout';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { StepperOrientation } from '@angular/cdk/stepper';
import * as data from '../../../mockdata.json'
import { ToastrService } from 'ngx-toastr';
import { MatSort} from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

export interface GuideData {
  title: string,
  link: string,
}

@Component({
  selector: 'app-lab',
  templateUrl: './lab.component.html',
  styleUrls: ['./lab.component.css']
})
export class LabComponent implements OnInit, AfterViewInit {

  stepperOrientation: Observable<StepperOrientation>
  breakpoint: any
  breakpointParameter: any
  id = '';
  allData: any = (data as any).default;
  labinfo:any
  experimentId: any
  experimentActivities: any = []
  experimentVideos:any=[]
  dataSource: MatTableDataSource<GuideData>;
  displayedColumns: string[] = ['title', 'link'];

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;


  constructor(private route: ActivatedRoute, private http: HttpClient, private builder:FormBuilder, private toastr: ToastrService, private router: Router) 
  { const breakpointObserver = inject(BreakpointObserver);
    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({matches}) => (matches ? 'horizontal' : 'vertical')));
      this.loadLabInfo()
    this.dataSource = new MatTableDataSource(this.labinfo.introduction.guides.map(function(guide:any) {return {
      title: guide.title,
      link: guide.link,
    }}));
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.breakpoint = Math.floor(window.innerWidth / 200);
    this.breakpointParameter =  Math.floor(window.innerWidth / 400);
    this.syncSelectedOptionsWithVideos();
  }

  loadLabInfo():void{
    this.id = this.route.snapshot.params['id'];
    let labIndex = this.allData.map((lab: { id: any; }) => lab.id).indexOf(this.id);
    if(labIndex >= 0){
      this.labinfo = this.allData[labIndex]
    }else {
      this.toastr.error(`Incorrect Laboratory`);
      this.router.navigateByUrl('');
    }
  }

  onResize(event : any):void {
    this.breakpoint = Math.floor(event.target.innerWidth / 200);
  }

  onResizeParameter(event : any):void {
    this.breakpointParameter =  Math.floor(event.target.innerWidth / 400);
  }

  redirectTo(link: string) {
    window.open(link)
  }


  studentExperiment = this.builder.group({
    selectedOptions : new FormArray([]),
    results: new FormArray([]),
  })

  getVideos(){
    this.experimentVideos=[]
    this.labinfo.experiments.forEach((experiment: {
      activities: any; selectedOptions: any; videos: any, id:any; 
    }) => {
      if (experiment.selectedOptions.every( (v: any) => this.getSelectedOptions().value.includes(v)) ) {
        this.experimentVideos = experiment.videos;
        this.experimentId = experiment.id
        this.experimentActivities = experiment.activities
        //this.experimentActivities = this.labinfo.activities
      }
    });
    this.syncActivities()
  }


  getSelectedOptions(){
    return this.studentExperiment.get('selectedOptions') as FormArray
  }

  syncSelectedOptionsWithVideos() {
    const parametersLength = this.labinfo.parameters.length;
    this.labinfo.parameters.forEach(() => {
      const selectedOptionsArray = this.studentExperiment.get('selectedOptions') as FormArray;
  
      // Añadir los controles que falten si hay más parámetros que opciones seleccionadas
      while (selectedOptionsArray.length < parametersLength) {
        selectedOptionsArray.push(this.builder.control(''));
      }
  
      // Eliminar los controles extra si hay más opciones seleccionadas que parámetros
      while (selectedOptionsArray.length > parametersLength) {
        selectedOptionsArray.removeAt(selectedOptionsArray.length - 1);
      }
    });
    this.getVideos()
  }
  syncActivities() {

    const resultsArray = this.studentExperiment.get('results') as FormArray;

    while (resultsArray.length < this.experimentActivities.length) {
      resultsArray.push(this.builder.control(''));
    }

    // Eliminar los controles extra si hay más opciones seleccionadas que parámetros
    while (resultsArray.length > this.experimentActivities.length) {
      resultsArray.removeAt(resultsArray.length - 1);
    }
  }
}
