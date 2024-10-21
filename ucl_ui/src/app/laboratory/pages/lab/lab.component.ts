import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {BreakpointObserver} from '@angular/cdk/layout';
import { FormGroup, FormArray, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { StepperOrientation } from '@angular/cdk/stepper';
import * as data from '../../../mockdata.json'
import { ToastrService } from 'ngx-toastr';
import { MatSort} from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { units } from 'src/app/laboratory/store/units-data-store';

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
  dataSource: MatTableDataSource<GuideData>;
  displayedColumns: string[] = ['title', 'link'];
  selectedTabIndex: number = 0;
  unit_groups : any= []

  studentSession: FormGroup;
  optionsList: any[] = []; 
  duplicateExperimentMessage = ''; 

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

    this.studentSession = this.builder.group({
      experiments: this.builder.array([]),
      finalActivities: this.builder.array([])
    });

    this.unit_groups = units

    this.optionsList = this.labinfo.parameters
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
   
    this.breakpoint = Math.floor(window.innerWidth / 200);
    this.breakpointParameter =  Math.floor(window.innerWidth / 400);
    this.createActivitiesArray()
    this.addExperiment(); 
  }

  addExperiment() {

    const newTabIndex = this.experiments.controls.length;

    const experimentArray = this.studentSession.get('experiments') as FormArray;

    const optionsLength = this.optionsList.length || 3; // Assume we know the number of option dropdowns

    const experimentGroup = this.builder.group({
      optionsGroup: this.builder.group({
        selectedOptions: this.createOptionsArray(optionsLength)
      }),
      experimentFound: [false],  // Experiment found flag
      experimentNotFound: [false], // Experiment not found flag
      experimentDetailsGroup: this.builder.group({
        id: [''],
        activities: this.builder.array([]),
        videos: [[]],
        dataFile: ['']
      })
    });

    experimentArray.push(experimentGroup);
    this.selectedTabIndex = newTabIndex
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

  onOptionChange(experiment: AbstractControl, experimentIndex: number) {
    const selectedOptions = experiment.get('optionsGroup')?.get('selectedOptions')?.value;

    // Check if all options have been selected (no empty values)
    const allOptionsSelected = selectedOptions.every((option: any) => option !== '');

    if (!allOptionsSelected) {
      // If not all options are selected, reset the flags and don't show any message
      experiment.get('experimentNotFound')?.setValue(false);
      experiment.get('experimentFound')?.setValue(false);
      this.duplicateExperimentMessage = '';
      return; // Stop execution if not all options are selected
    }


    // Fetch the experiment based on selected options
    if (this.isDuplicateOptions(selectedOptions, experimentIndex)) {
      this.duplicateExperimentMessage = `This Configuration is duplicated in another Experiment. Please select other Configuration.`;
      experiment.get('experimentNotFound')?.setValue(false);
    } else {
      this.duplicateExperimentMessage = '';
    const experimentFound = this.getExperimentByOptions(selectedOptions)
        if (experimentFound) {
          // Experiment found
          experiment.get('experimentFound')?.setValue(true);
          experiment.get('experimentNotFound')?.setValue(false);
          this.populateExperimentForm(experimentFound, experiment);
        } else {
          // No experiment found with these options
          experiment.get('experimentFound')?.setValue(false);
          experiment.get('experimentNotFound')?.setValue(true);
        }
      }
  }


  isDuplicateOptions(selectedOptions: any[], currentIndex: number): boolean {
    const experimentArray = this.studentSession.get('experiments') as FormArray;

    return experimentArray.controls.some((experiment, index) => {
      if (index !== currentIndex) {
        const options = (experiment.get('optionsGroup')?.get('selectedOptions') as FormArray).value;
        return JSON.stringify(options) === JSON.stringify(selectedOptions);
      }
      return false;
    });
  }

  deleteExperiment(index: number): void {
    const experimentsArray = this.studentSession.get('experiments') as FormArray;
    
    if (experimentsArray.length > 1) {
      experimentsArray.removeAt(index); // Elimina el experimento en la posición 'index'
    } 
  
    // Si quieres que después de borrar seleccione otro tab
    if (this.selectedTabIndex >= experimentsArray.length) {
      this.selectedTabIndex = experimentsArray.length - 1; // Ajusta el índice si se elimina el último tab
    }
  }

  populateExperimentForm(experimentData: any, experiment: AbstractControl) {
    const experimentDetailsGroup = experiment.get('experimentDetailsGroup') as FormGroup;

    experimentDetailsGroup.patchValue({
      id: experimentData.id,
      videos: experimentData.videos,
      dataFile: experimentData.dataFile
    });

    const activityArray = experimentDetailsGroup.get('activities') as FormArray;
    activityArray.clear(); // Clear existing activities

    // Populate activities
    const experimentActivities = this.getActivitiesByExperimentId(experimentData.id)

      experimentActivities.forEach((activity: { id: any, statement: any }) => {
        activityArray.push(this.builder.group({
          id: [activity.id],
          statement: [activity.statement],
          result: [''],  
          procedure: [''],
          unit: ['']
        }));
      });

  }

  getActivitiesByExperimentId(id: any){
    const foundExperiment = this.labinfo.experiments.find((experiment: {
      activities: any; selectedOptions: any; videos: any, id: any;
    }) => {

      return experiment.id === id;
    });
  
    // Return the activities if the experiment is found, or null if not
    return foundExperiment ? foundExperiment.activities : null;
  }

  getExperimentByOptions(options :any){
    const foundExperiment = this.labinfo.experiments.find((experiment: {
      activities: any; selectedOptions: any; videos: any, id: any;
    }) => {
  
      return experiment.selectedOptions.every((v: any) => options.includes(v));
    });
  
    // Return the found experiment or null if none is found
    return foundExperiment || null;
  }

  
  createOptionsArray(length: number): FormArray {
    const optionsArray = this.builder.array([]);
    for (let i = 0; i < length; i++) {
      optionsArray.push(this.builder.control('')); // You can also pre-fill with default values
    }
    return optionsArray;
  }

  createActivitiesArray(){
    const activityArray = this.studentSession.get('finalActivities') as FormArray;
    activityArray.clear(); // Clear existing activities
    this.labinfo.activities.forEach((activity: { id: any, statement: any }) => {
      activityArray.push(this.builder.group({
        id: [activity.id],
        statement: [activity.statement],
        result: [''],
        procedure: [''],
        unit: ['']
      }));
    })
  }

  get finalActivities():FormArray {
      return this.studentSession.get('finalActivities') as FormArray
  }

  get experiments():FormArray {
    return this.studentSession.get('experiments') as FormArray
  }

  getOptions(experiment: AbstractControl) {
    return experiment.get('optionsGroup')?.get('selectedOptions') as FormArray;
  }

  getActivities(experiment: AbstractControl) {
    return experiment.get('experimentDetailsGroup')?.get('activities') as FormArray;
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


  onSubmit(): void {
    if (this.studentSession.valid) {
    this.toastr.success(
      "Experiment Saved", "Success"
    );
    console.log(this.studentSession.value)
    } else {
      this.toastr.error(
        'Please, complete the required Information',
        'Invalid action'
      );
    }
  }
}
