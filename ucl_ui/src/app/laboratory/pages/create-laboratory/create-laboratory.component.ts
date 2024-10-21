import { Component, OnInit, Inject, inject, ViewChild, ElementRef} from '@angular/core';
import { StepperOrientation } from '@angular/cdk/stepper';
import {Observable} from 'rxjs';
import {BreakpointObserver} from '@angular/cdk/layout';
import {map} from 'rxjs/operators';
import { FormArray, FormBuilder,FormControl,FormGroup,Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { v4 as uuidv4 } from 'uuid'; 
import { Router } from '@angular/router';
import { units } from 'src/app/laboratory/store/units-data-store';

@Component({
  selector: 'app-create-laboratory',
  templateUrl: './create-laboratory.component.html',
  styleUrls: ['./create-laboratory.component.css']
})
export class CreateLaboratoryComponent implements OnInit {

  @ViewChild('videoPlayer') videoplayer!: ElementRef;
  stepperOrientation: Observable<StepperOrientation>
  breakpoint: any
  breakpointVideo: any
  breakpointOption: any
  videoRowHeight: any
  defaultImg = '../../../../assets/emptyimage.jpeg';
  categories = [
    {name: 'Photovoltaic Energy'},
    {name: 'Thermal Energy'},
    {name: 'Spectometry'},
    {name: 'Wind Energy'},
    {name: 'Hydraulic Energy'},
    {name: 'Other'},
  ];
  unit_groups : any= []

  constructor( private builder:FormBuilder, private toastr: ToastrService, private router: Router) {
      const breakpointObserver = inject(BreakpointObserver);
      this.stepperOrientation = breakpointObserver
        .observe('(min-width: 800px)')
        .pipe(map(({matches}) => (matches ? 'horizontal' : 'vertical')));
    this.unit_groups = units
  }

  ngOnInit():void {
    this.videoRowHeight = window.innerWidth <= 600 ? 340 : 380
    this.breakpoint = Math.floor(window.innerWidth / 260);
    this.breakpointVideo =  Math.floor((window.innerWidth  / 400) / 2);
    this.breakpointOption = Math.floor(window.innerWidth  / 400);
    this.parameters.valueChanges.subscribe(() => {
      this.syncSelectedOptionsWithParameters();
    });
  }

  onResize(event : any):void {
    this.breakpoint = Math.floor(event.target.innerWidth / 260);
  }

  onResizeParameter(event : any):void {
    this.videoRowHeight = window.innerWidth <= 600 ? 340 : 380
    this.breakpointOption = Math.floor(window.innerWidth  / 400);
    this.breakpointVideo =  Math.floor((event.target.innerWidth / 400) / 2);
  }

  newLaboratory=this.builder.group({
    id: [uuidv4()],
    info: this.builder.group({
      institution: this.builder.control("",Validators.required),
      name: this.builder.control("",Validators.required),
      category: this.builder.control("",Validators.required),
    }),
    introduction: this.builder.group({
      description: this.builder.control("",Validators.required),
      introVideo:this.builder.group({
        video: [''],
      }),
      guides:new FormArray([
        this.builder.group({
          title: [''],
          link: ['']
        })
      ]),
    }),
    parameters: this.builder.array([
      this.builder.group({
          name: [''], 
          options: new FormArray([this.builder.group({
            id: [uuidv4()], 
            value: [''], 
            unit: [''],
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
      })]),
      activities: new FormArray([
        this.builder.group({
          id: [uuidv4()], 
          statement: [''],
          result: [''],
          unit: ['']
        })
      ]),
      dataFile: this.builder.control("")
    })]),
    activities: this.builder.array([
      this.builder.group({
        id: [uuidv4()], 
        statement: [''],
        result: [''],
        unit: ['']
      })
    ])
  })

  get introVideo():FormGroup {
    return this.newLaboratory.get('introduction')?.get('introVideo') as FormGroup
  }

  get info():FormGroup {
    return this.newLaboratory.get('info') as FormGroup
  }

  get introduction():FormGroup {
    return this.newLaboratory.get('introduction') as FormGroup
  }
  get guides():FormArray {
    return this.newLaboratory.get("introduction")?.get('guides') as FormArray
    }
  
    deleteGuide(index:any):void{
    this.guides.removeAt(index)
    }
  
    addGuide():void{
      const guideFormGroup = this.builder.group({
        title: [''],
        link: ['']
      })
      this.guides.push(guideFormGroup)
    }

  get parameters():FormArray {
    return this.newLaboratory.get('parameters') as FormArray
  }

  addParameter():void{
    const parametersFormGroup = this.builder.group({
      name: [''], 
      options: new FormArray([this.builder.group({
        id: [uuidv4()],
        value: [''], 
        unit: [''],
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
          id: [uuidv4()],
          value: [''], 
          unit: [''],
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
      })]),
      activities:  new FormArray([
        this.builder.group({
          statement: [''],
          result: [''],
          unit: ['']
        })
      ]),
      dataFile:this.builder.control('')
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
  deleteVideo(index:number, videoIndex:number):void{
   this.getVideos(index).removeAt(videoIndex)
  }

  getExperimentActivites(index:number){
    return this.experiments.at(index).get('activities') as FormArray
  }


  addExperimentActivity(index:number):void{
    const activityFormGroup = this.builder.group({
      statement: [''],
      result: [''],
      unit: ['']
    })
    this.getExperimentActivites(index).push(activityFormGroup)
  }

  deleteExperimentActivity(index:number, activityIndex:number):void{
    this.getExperimentActivites(index).removeAt(activityIndex)
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
        result: [''],
        unit: ['']
    })
      this.activities.push(activityFormGroup)
    }

    getDataFile(index:number){
      return this.experiments.at(index).get('dataFile') as FormControl
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

  onUploadIntro(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0] as File;
      const file_size = file.size;
      if (file_size <= 50000000) {
        this.getUrlIntro(file);
      }
      else {
        this.toastr.error("File size must be 50MB or smaller.");
      }
    }
  }

  async getUrlIntro(file: any) {
    var reader = new FileReader();
    reader.onload = (event: any) => {
        this.introVideo.patchValue({
          video:event.target.result
        })
        this.introVideo.get('video')?.updateValueAndValidity();
    };
    reader.onerror = (event: any) => {
      console.log('File could not be read: ' + event.target.error.code);
    };
    reader.readAsDataURL(file);
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
      else if(field == 'file'){
        this.experiments.at(index).get('dataFile')?.patchValue({dataFile:event.target.result})
        this.experiments.at(index).get('dataFile')?.updateValueAndValidity();
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
    this.toastr.success(
      'Now you will be redirected to your new Laboratory!',
      this.newLaboratory.value.info?.name + " Successfully Created!"
    );
    console.log(this.newLaboratory.value)
    this.router.navigate(['/ultra-concurrent-rl', this.newLaboratory.value.id])
    } else {
      this.toastr.error(
        'Please, complete the required Information',
        'Invalid action'
      );
    }
  }
}
