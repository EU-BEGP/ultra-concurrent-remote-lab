import { Component, OnInit, Inject, inject, ViewChild, ElementRef} from '@angular/core';
import { StepperOrientation } from '@angular/cdk/stepper';
import {Observable} from 'rxjs';
import {BreakpointObserver} from '@angular/cdk/layout';
import {map} from 'rxjs/operators';
import { FormArray, FormBuilder,FormGroup,Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { v4 as uuidv4 } from 'uuid'; 

@Component({
  selector: 'app-create-laboratory',
  templateUrl: './create-laboratory.component.html',
  styleUrls: ['./create-laboratory.component.css']
})
export class CreateLaboratoryComponent implements OnInit {

  @ViewChild('videoPlayer') videoplayer!: ElementRef;
  stepperOrientation: Observable<StepperOrientation>
  breakpoint: any
  breakpointParameter: any
  defaultImg = '../../../../assets/emptyimage.jpeg';
  categories = [
    {name: 'Physics'},
    {name: 'Biology'},
    {name: 'Chemistry'},
    {name: 'Electronics'},
    {name: 'Engineering'},
  ];

  constructor( private builder:FormBuilder, private toastr: ToastrService,) {
      const breakpointObserver = inject(BreakpointObserver);
      this.stepperOrientation = breakpointObserver
        .observe('(min-width: 800px)')
        .pipe(map(({matches}) => (matches ? 'horizontal' : 'vertical')));

  }

  ngOnInit():void {
    this.breakpoint = Math.floor(window.innerWidth / 200);
    this.breakpointParameter =  Math.floor(window.innerWidth / 400);
    this.parameters.valueChanges.subscribe(() => {
      this.syncSelectedOptionsWithParameters();
    });
  }

  onResize(event : any):void {
    this.breakpoint = Math.floor(event.target.innerWidth / 200);
  }

  onResizeParameter(event : any):void {
    this.breakpointParameter =  Math.floor(event.target.innerWidth / 400);
  }

  generateUniqueId() {
    return Math.random().toString(36).substring(2, 9);
  }


  newLaboratory=this.builder.group({
    info: this.builder.group({
      institution: this.builder.control("",Validators.required),
      name: this.builder.control("",Validators.required),
      category: this.builder.control("",Validators.required),
      description: this.builder.control("",Validators.required)
    }),
    parameters: this.builder.array([
      this.builder.group({
          name: [''], 
          options: new FormArray([this.builder.group({
            id: [this.generateUniqueId()], 
            value: [''], 
            photo: [this.defaultImg]
          }
        )])
      })
    ]),
    experiments: this.builder.array([this.builder.group({
      selectedOptions: new FormArray([this.builder.control('', Validators.required)]),
      videos: new FormArray([this.builder.group({
        name: [''], 
        video: ['']
      })])
    })]),
    activities: this.builder.array([
      this.builder.group({
        statement: [''],
        result: ['']
      })
    ])
  })


  get info():FormGroup {
    return this.newLaboratory.get('info') as FormGroup
  }

  get parameters():FormArray {
    return this.newLaboratory.get('parameters') as FormArray
  }

  addParameter():void{
    const parametersFormGroup = this.builder.group({
      name: [''], 
      options: new FormArray([this.builder.group({
        id: [this.generateUniqueId()],
        value: [''], 
        photo: [this.defaultImg]
      }
    )])
  })
    this.parameters.push(parametersFormGroup)
  }

  getOptions(index:number){
    return this.parameters.at(index).get('options') as FormArray
  }

  addOption(index:number):void{
    const optionFormGroup = this.builder.group({
          id: [this.generateUniqueId()],
          value: [''], 
          photo: [this.defaultImg]
      })
    this.getOptions(index).push(optionFormGroup)
  }

  deleteOption(index:number, optionIndex:number):void{
   this.getOptions(index).removeAt(optionIndex)
  }

  deleteParameter(index:any):void{
  this.parameters.removeAt(index)
  }

  get experiments():FormArray {
  return this.newLaboratory.get('experiments') as FormArray
  }

  deleteExperiment(index:any):void{
  this.experiments.removeAt(index)
  }

  addExperiment():void{
    
    const selectedOptionsArray = this.builder.array([]);
    this.parameters.controls.forEach(() => {
      selectedOptionsArray.push(this.builder.control('', Validators.required));
    });

    this.experiments.push(this.builder.group({
      selectedOptions: selectedOptionsArray,
      videos: new FormArray([this.builder.group({
        name: [''], 
        video: ['']
      })])
    }));
  }

  getAvailableOptions(parameterIndex: number) {
    const optionsArray = this.parameters.at(parameterIndex).get('options') as FormArray;
    return optionsArray.controls.map((option) => option);
  }

  syncSelectedOptionsWithParameters() {
    const parametersLength = this.parameters.length;
  
    this.experiments.controls.forEach((experiment) => {
      const selectedOptionsArray = experiment.get('selectedOptions') as FormArray;
  
      // Añadir los controles que falten si hay más parámetros que opciones seleccionadas
      while (selectedOptionsArray.length < parametersLength) {
        selectedOptionsArray.push(this.builder.control(''));
      }
  
      // Eliminar los controles extra si hay más opciones seleccionadas que parámetros
      while (selectedOptionsArray.length > parametersLength) {
        selectedOptionsArray.removeAt(selectedOptionsArray.length - 1);
      }
    });
  }

  getVideos(index:number){
    return this.experiments.at(index).get('videos') as FormArray
  }

  addVideo(index:number):void{
    const videoFormGroup = this.builder.group({
          name: [''], 
          video: ['']
      })
    this.getVideos(index).push(videoFormGroup)
  }

  deleteVideo(index:number, optionIndex:number):void{
   this.getVideos(index).removeAt(optionIndex)
  }

  get activities():FormArray {
    return this.newLaboratory.get('activities') as FormArray
    }
  
    deleteActivity(index:any):void{
    this.activities.removeAt(index)
    }
  
    addActivity():void{
      const activityFormGroup = this.builder.group({
        statement: [''],
        result: ['']
    })
      this.activities.push(activityFormGroup)
    }
  

  onUploadFile(event: any,parameterIndex:number, index: number, field: string): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0] as File;
      const file_size = file.size;
      if (file_size <= 50000000) {
        this.getUrlFile(file,parameterIndex, index, field);
      }
      else {
        this.toastr.error("File size must be 50MB or smaller.");
      }
    }
    
  }

  async getUrlFile(file: any,parameterIndex:number, index: number, field: string) {
    var reader = new FileReader();
    reader.onload = (event: any) => {
      if(field == 'image'){
        this.getOptions(parameterIndex).at(index).patchValue({
          photo:event.target.result
        })
        this.getOptions(parameterIndex).at(index).get('photo')?.updateValueAndValidity();
      }
      else if(field == 'video'){
        this.getVideos(parameterIndex).at(index).patchValue({
          video:event.target.result
        })
        this.getVideos(parameterIndex).at(index).get('video')?.updateValueAndValidity();
      }
    };
    reader.onerror = (event: any) => {
      console.log('File could not be read: ' + event.target.error.code);
    };

    reader.readAsDataURL(file);
  }
  toggleVideo(event: any) {
    this.videoplayer.nativeElement.play();
  }

  onSubmit(): void {
    if (this.newLaboratory.valid) {
    console.log(this.newLaboratory.value)
    } else {
      this.toastr.error(
        'Please, complete the required Information',
        'Invalid action'
      );
    }
  }
}
