import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {BreakpointObserver} from '@angular/cdk/layout';
import { FormGroup, FormArray, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { StepperOrientation } from '@angular/cdk/stepper';
import { ToastrService } from 'ngx-toastr';
import { MatSort} from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { units } from 'src/app/laboratory/store/units-data-store';
import Handsontable from 'handsontable';
import { MatDialog } from '@angular/material/dialog';
import { ProcedureToolsDialogComponent } from '../../components/procedure-tools-dialog/procedure-tools-dialog.component';
import { LaboratoryService } from '../../services/laboratory.service';
import { Laboratory } from '../../interfaces/laboratory';
import { Guide } from '../../interfaces/guide';
import { Activity } from '../../interfaces/activity';
import { v4 as uuidv4 } from 'uuid';
import { SessionService } from '../../services/session.service';
import { Session } from '../../interfaces/session';
import { UserService } from 'src/app/core/auth/services/user.service';
import { User } from 'src/app/core/auth/interfaces/user';
import { ChangeDetectorRef } from '@angular/core';
import { SimpleInputDialogComponent } from '../../components/simple-input-dialog/simple-input-dialog.component';

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
  dataSource!: MatTableDataSource<Guide>;
  displayedColumns: string[] = ['title', 'url'];
  selectedTabIndex!: number ;
  unit_groups : any= []
  laboratory!: Laboratory | undefined
  laboratory_guides!: Guide[]
  labActivities!:any[]
  defaultImg = 'assets/emptyimage.jpeg';

  userId :number | undefined 
  studentSession!: FormGroup;
  optionsList: any[] = []; 
  duplicateExperimentMessage = ''; 

  timeSeriesData = [
    {
      name: 'Experiment A',
      values: { x: ['2024-01-01', '2024-02-01', '2024-03-01'], y: [10, 15, 12] },
    },
    {
      name: 'Experiment B',
      values: { x: ['2024-01-01', '2024-02-01', '2024-03-01'], y: [5, 8, 6] },
    },
  ];

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;
  sessionName:string | undefined

  constructor(private route: ActivatedRoute, 
    private http: HttpClient,
    private labService: LaboratoryService,
    private builder:FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private dialogRef: MatDialog,
    private sessionService: SessionService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) 

  { const breakpointObserver = inject(BreakpointObserver);

    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({matches}) => (matches ? 'horizontal' : 'vertical')));

    this.studentSession = this.builder.group({
      id:[uuidv4()],
      experiments: this.builder.array([]),
      finalActivities: this.builder.array([])
    });

    this.loadLabInfo()

    this.getUserId()

    this.unit_groups = units    
  }

  
  getUserId(){
    const token = localStorage.getItem('token');

    if (token) {
      this.userService.getUserData().subscribe(
        (user : User) => {
          this.userId = user.id 
        },
        (err : any) => (this.userId = undefined)
      );
    } else {
      this.userId = undefined;
    }
  }

  ngOnInit(): void {
   
    this.breakpoint = Math.floor(window.innerWidth / 200);
    this.breakpointParameter =  Math.floor(window.innerWidth / 400);
    this.createActivitiesArray()
  }


  loadLabInfo():void{
    this.id = this.route.snapshot.params['id'];

    this.labService.getLabById(this.id).subscribe({
      next: (lab : any) => {
       this.laboratory = lab
      },
      error: (e: any) => {
        console.log(e)
        this.toastr.error(
          'There was an error getting the Laboratory. Please try again later.'
        );
        this.router.navigateByUrl('');
      },
    });

    this.labService.getLabGuides(this.id).subscribe({
      next: (guides : any) => {
       this.laboratory_guides = guides
       this.dataSource = new MatTableDataSource(guides.map(function(guide:any) {return {
        title: guide.title,
        url: guide.url,
      }}));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (e: any) => {
        console.log(e)
        this.toastr.error(
          'There was an error getting the Laboratory. Please try again later.'
        );
        this.router.navigateByUrl('');
      },
    });

    this.labService.getLabParameters(this.id).subscribe({
      next: (parameters : any) => {
        this.optionsList = parameters
        this.createOptionsArray(this.optionsList.length)
        this.addExperiment(); 
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


  addExperiment() {

    const newTabIndex = this.experiments.controls.length;

    const experimentArray = this.studentSession.get('experiments') as FormArray;

    const optionsLength = this.optionsList.length || 3; 

    const experimentGroup = this.builder.group({
      optionsGroup: this.builder.group({
        selectedOptions: this.createOptionsArray(optionsLength)
      }),
      experimentFound: [false], 
      experimentNotFound: [false], 
      experimentDetailsGroup: this.builder.group({
        id: [''],
        experiment_activities: this.builder.array([]),
        experiment_media: [[]],
        data_file: ['']
      })
    });

    experimentArray.push(experimentGroup);
    setTimeout(() => {
      this.selectedTabIndex = newTabIndex 
    });
  }

  async onOptionChange(experiment: AbstractControl, experimentIndex: number) {
    const selectedOptions = experiment.get('optionsGroup')?.get('selectedOptions')?.value;

    const allOptionsSelected = selectedOptions.every((option: any) => option !== '');

    if (!allOptionsSelected) {
      // If not all options are selected, reset the flags and don't show any message
      experiment.get('experimentNotFound')?.setValue(false);
      experiment.get('experimentFound')?.setValue(false);
      this.duplicateExperimentMessage = '';
      return; 
    }


    // Fetch the experiment based on selected options
    if (this.isDuplicateOptions(selectedOptions, experimentIndex)) {
      this.duplicateExperimentMessage = `This Configuration is duplicated in another Experiment. Please select other Configuration.`;
      experiment.get('experimentNotFound')?.setValue(false);
    } else {
      this.duplicateExperimentMessage = '';
      const experimentFound = await this.getExperimentByOptions(selectedOptions)
      if (experimentFound) {
        // Experiment found
        experiment.get('experimentFound')?.setValue(true);
        experiment.get('experimentNotFound')?.setValue(false);
        await this.populateExperimentForm(experimentFound, experiment);
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
      experimentsArray.removeAt(index);
    } 

    if (this.selectedTabIndex >= experimentsArray.length) {
      this.selectedTabIndex = experimentsArray.length - 1;
    }
  }

  downloadDataFile(fileUrl: string): void {
    if (fileUrl) {
      // Crear un enlace de descarga temporal
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileUrl.split('/').pop() || 'downloaded_file';  // Nombre del archivo
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);  // Eliminar el enlace una vez descargado
    } else {
      this.toastr.info(
        "This Experiment has no Data to Download"
      );
    }
  }

  async populateExperimentForm(experimentData: any, experiment: AbstractControl) {
    const experimentDetailsGroup = experiment.get('experimentDetailsGroup') as FormGroup;
    experimentDetailsGroup.patchValue({
      id: experimentData.id,
      experiment_media: experimentData.experiment_media,
      data_file: experimentData.data_file,
      experiment_activities:experimentData.experiment_activities
    });

    const activityArray = experimentDetailsGroup.get('experiment_activities') as FormArray;
    activityArray.clear(); // Clear existing activities
    

    // Populate activities
    const experimentActivities = await this.getActivitiesByExperimentId(experimentData.id)

      experimentActivities.forEach((activity: any) => {
        activityArray.push(this.builder.group({
          id: [activity.id],
          statement: [activity.statement],
          expected_result: [activity.expected_result],
          result: [''],  
          procedures: this.builder.array(  
            activity.procedures 
              ? activity.procedures.map((procedure: any) => this.builder.group({
                  data: [JSON.parse(procedure.data)],
                  data_headers:[JSON.parse(procedure.data_headers)],
                  data_type: [procedure.data_type]
                })) 
              : [] 
          ),
          result_unit: [activity.result_unit]
        }));
      });

  }

  getActivitiesByExperimentId(id: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.labService.getActivitiesByExperimentId(id).subscribe({
        next: (activities: any) => resolve(activities),
        error: (e: any) => reject(null),
      });
    });
  }

  getExperimentByOptions(options: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.labService.getExperimentByOptions(options, this.id).subscribe({
        next: (experiment: any) => resolve(experiment),
        error: (e: any) => {
          console.log(e)
          resolve(undefined)
        },
      });
    });
  }
  
  createOptionsArray(length: number): FormArray {
    const optionsArray = this.builder.array([]);
    for (let i = 0; i < length; i++) {
      optionsArray.push(this.builder.control(''));
    }
    return optionsArray;
  }

  async createActivitiesArray() {
    const activityArray = this.studentSession.get('finalActivities') as FormArray;
    activityArray.clear(); // Limpia las actividades actuales
    this.labActivities = await this.getLabActivities();
    
    this.labActivities.forEach((activity: any) => {
      activityArray.push(this.builder.group({
        id: [activity.id],
        statement: [activity.statement],
        expected_result: [activity.expected_result],
        result: [''],
        procedures: this.builder.array(  
          activity.procedures 
            ? activity.procedures.map((procedure: any) => this.builder.group({
                data: [JSON.parse(procedure.data)],
                data_headers:[JSON.parse(procedure.data_headers)],
                data_type: [procedure.data_type]
              })) 
            : [] 
        ),
        result_unit: [activity.result_unit]
      }));
    });
}


  getLabActivities(): Promise<any> {
  return new Promise((resolve, reject) => {
    this.labService.getLabActivities(this.id).subscribe({
      next: (activities: any) => resolve(activities),
      error: (e: any) => {
        console.log(e);
        this.toastr.error(
          'There was an error getting the Laboratory. Please try again later.'
        );
        this.router.navigateByUrl('');
        reject(e);  // Rechaza la promesa si hay un error
      },
    });
  });
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
    return experiment.get('experimentDetailsGroup')?.get('experiment_activities') as FormArray;
  }

  getFinalActivityProcedures(activityIndex: number) {
    return this.finalActivities.at(activityIndex).get('procedures') as FormArray;
  }

  addProcedureTable(activityIndex: number, data_type:string) {
    const procedureArray = this.finalActivities.at(activityIndex).get('procedures') as FormArray;
    
    procedureArray.push(this.builder.group({
      data: [Handsontable.helper.createSpreadsheetData(5, 2)], 
      data_headers:[['C 1', 'C 2']],
      data_type: data_type,
    }));
  }

  onTableDataChange(activityIndex: number, procedureIndex: number, newData: any) {
    const procedure = this.getFinalActivityProcedures(activityIndex).at(procedureIndex);
    if (procedure) {
      procedure.get('data')?.setValue(JSON.parse(JSON.stringify(newData.data)));
      procedure.get('data_headers')?.setValue(JSON.parse(JSON.stringify(newData.headers)));
      this.cdr.detectChanges();  // Fuerza la actualización del gráfico
    }
  }

  addExperimentProcedureTable(experiment: AbstractControl, activityIndex: number, data_type: string) {
    const procedureArray = this.getActivities(experiment).at(activityIndex).get('procedures') as FormArray;
    
    procedureArray.push(this.builder.group({
      data: [Handsontable.helper.createSpreadsheetData(5, 2)],
      data_headers:[['C 1', 'C 2']], 
      data_type: data_type
    }));
  }

  onExperimentTableDataChange(experiment: AbstractControl, activityIndex: number, procedureIndex: number, newData: any) {
    const procedure = this.getExperimentActivityProcedures(experiment, activityIndex).at(procedureIndex)
    if (procedure) {
      procedure.get('data')?.setValue(JSON.parse(JSON.stringify(newData.data)));
      procedure.get('data_headers')?.setValue(JSON.parse(JSON.stringify(newData.headers)));
      this.cdr.detectChanges();  // Fuerza la actualización del gráfico
    }
  }

  getExperimentActivityProcedures(experiment: AbstractControl,activityIndex: number) {
    return this.getActivities(experiment).at(activityIndex).get('procedures') as FormArray;
  }

  removeProcedure(activityIndex: number, procedureIndex: number) {
    const procedures = this.finalActivities.at(activityIndex).get('procedures') as FormArray;
    procedures.removeAt(procedureIndex);
  }

  removeExperimentActivityProcedure(experiment: AbstractControl, activityIndex: number, procedureIndex: number) {
    const procedures = this.getActivities(experiment).at(activityIndex).get('procedures') as FormArray;
    procedures.removeAt(procedureIndex);
  }

  openProcedures(data : any){
    const dialogRef = this.dialogRef.open(ProcedureToolsDialogComponent, {
      width: '50vw'
     })    
     dialogRef.componentInstance.selectedOption.subscribe((selectedType:string) => {
      this.addSelectedProcedure(data, selectedType)
    });
  
  }

  addSelectedProcedure (data:any, selectedProcedureType:String) {
    if(data.experiment){ //if its a Experiment Activity
      if(selectedProcedureType == "Time-Line"){
        this.addExperimentProcedureTable(data.experiment,data.activityIndex, "chart")
      }
      else if(selectedProcedureType == "Dynamic Tables"){
        this.addExperimentProcedureTable(data.experiment,data.activityIndex, "table")
      }
    }else{ //if its a Final Activity
      if(selectedProcedureType == "Time-Line"){
        this.addProcedureTable(data.activityIndex, "chart")
      } else if(selectedProcedureType == "Dynamic Tables"){
        this.addProcedureTable(data.activityIndex, "table")
      }
    }
  }

  trackByFn(index: number, item: AbstractControl) {
    return item.value?.id || index;
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

   openNameDialog() {
      const dialogRef = this.dialog.open(SimpleInputDialogComponent, {
        data: { title: 'Enter a Name for the Session', label: 'Session Name', value: "Session 1" },
        autoFocus: true,    
        width: '400px',     
      });
  
      dialogRef.afterClosed().subscribe((result) => {
        if (result !== undefined) {
          this.sessionName=result
          this.saveSession()
        }
      });
      
    }


  onSubmit(): void {
    if (this.studentSession.valid) {
    this.openNameDialog()
    } else {
      this.toastr.error(
        'Please, complete the required Information',
        'Invalid action'
      );
    }
  }

  saveSession(){
    const sessionFields = {
      'id': this.studentSession.value.id,
      'laboratory': this.id,
      'user': this.userId,
      'name':this.sessionName
    }
    this.sessionService.addSession(sessionFields as Session).subscribe({
      next: (_: any) => {
       this.createSolvedFinalActivities()
       this.createSolvedExperimentActivities()
        this.toastr.success("Session Saved")
        this.studentSession.reset()
        this.router.navigateByUrl('/session/'+sessionFields.id);
      },
      error: (e: any) => {
        console.log(e)
        this.toastr.error(
          'There was an error saving your Session. Please try later.'
        );
      },
    });

  }

  createSolvedExperimentActivities(){
    
    this.experiments.value.forEach((experiment:any) => {
      (experiment)
      experiment.experimentDetailsGroup.experiment_activities.forEach((activity:any)=>{
        this.saveActivity(activity)
      })
    });
  }

  createSolvedFinalActivities(){
    
    this.finalActivities.value.forEach((activity:any) => {
      this.saveActivity(activity)
    });
  }

  saveActivity(activity:any){
    const solvedActivityFields = {
      'result': activity.result,
      'activity': activity.id,
      'session': this.studentSession.value.id,
      'procedures': activity.procedures
    }
    this.sessionService.addSolvedActivities(solvedActivityFields as Session).subscribe({
      next: (_: any) => {

      },
      error: (e: any) => {
        console.log(e)
        this.toastr.error(
          'There was an error saving the solved Activities. Please try later.'
        );
      },
    });
  }

}
