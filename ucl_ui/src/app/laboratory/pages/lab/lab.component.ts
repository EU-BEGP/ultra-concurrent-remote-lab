import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {BreakpointObserver} from '@angular/cdk/layout';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { StepperOrientation } from '@angular/cdk/stepper';
import * as data from '../../../mockdata.json'
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-lab',
  templateUrl: './lab.component.html',
  styleUrls: ['./lab.component.css']
})
export class LabComponent implements OnInit {

  stepperOrientation: Observable<StepperOrientation>
  breakpoint: any
  breakpointParameter: any
  id = '';
  allData: any = (data as any).default;
  labinfo:any
  experimentId: any
  experimentActivities: any = []
  experimentVideos:any=[]


  constructor(private route: ActivatedRoute, private http: HttpClient, private builder:FormBuilder, private toastr: ToastrService, private router: Router) 
  { const breakpointObserver = inject(BreakpointObserver);
    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({matches}) => (matches ? 'horizontal' : 'vertical')));
}

  ngOnInit(): void {
    this.loadLabInfo()
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


  studentExperiment = this.builder.group({
    selectedOptions : new FormArray([]),
    results: new FormArray([]),
  })

  getVideos(){
    this.labinfo.experiments.forEach((experiment: { selectedOptions: any; videos: any, id:any; }) => {
      if (experiment.selectedOptions.every( (v: any) => this.getSelectedOptions().value.includes(v)) ) {
        this.experimentVideos = experiment.videos;
        this.experimentId = experiment.id
        //this.experimentActivities = experiment.activies
        this.experimentActivities = this.labinfo.activities
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
