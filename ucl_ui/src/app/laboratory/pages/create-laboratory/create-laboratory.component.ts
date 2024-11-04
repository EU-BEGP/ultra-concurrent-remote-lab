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
import { UserService } from 'src/app/core/auth/services/user.service';
import { User } from 'src/app/core/auth/interfaces/user';
import { LaboratoryService } from '../../services/laboratory.service';
import { Laboratory } from '../../interfaces/laboratory';
import { Guide } from '../../interfaces/guide';
import { Parameter } from '../../interfaces/parameter';
import { Option } from '../../interfaces/option';

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
  currentUserId :any = 0 ;

  constructor( private builder:FormBuilder, private toastr: ToastrService, private router: Router, private userService: UserService, private labService: LaboratoryService) {
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
    this.getCurrentUserId();
  }

  getCurrentUserId(){
    this.userService.getUserData().subscribe((response: User) => {
      this.newLaboratory.get('info')?.get('instructor')?.setValue(response.id!);
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
      instructor: 0,
      institution: this.builder.control("",Validators.required),
      name: this.builder.control("",Validators.required),
      category: this.builder.control("",Validators.required),
    }),
    introduction: this.builder.group({
      description: this.builder.control("",Validators.required),
      introPhoto: this.builder.group({
        image: [this.defaultImg],
        file:['']
      }),
      introVideo:this.builder.group({
        video: [''],
        file:['']
      }),
      guides:new FormArray([
        this.builder.group({
          title: [''],
          url: ['']
        })
      ]),
    }),
    parameters: this.builder.array([
      this.builder.group({
          name: [''], 
          unit: [''],
          parameter_options: new FormArray([this.builder.group({
            id: [uuidv4()], 
            value: [''], 
            image: [this.defaultImg],
            file:['']
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

  get introPhoto() {
    return this.newLaboratory.get('introduction')?.get('introPhoto') as FormGroup
  }

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
        url: ['']
      })
      this.guides.push(guideFormGroup)
    }

  get parameters():FormArray {
    return this.newLaboratory.get('parameters') as FormArray
  }

  addParameter():void{
    const parametersFormGroup = this.builder.group({
      name: [''], 
      unit: [''],
      parameter_options: new FormArray([this.builder.group({
        id: [uuidv4()],
        value: [''],
        image: [this.defaultImg],
        file:['']
      }
    )])
  })
    this.parameters.push(parametersFormGroup)
  }

  getOptions(index:number){
    return this.parameters.at(index).get('parameter_options') as FormArray
  }

  addOption(index:number):void{
    const optionFormGroup = this.builder.group({
          id: [uuidv4()],
          value: [''],
          image: [this.defaultImg],
          file:['']
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
    const optionsArray = this.parameters.at(parameterIndex).get('parameter_options') as FormArray;
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
  
  

    onUpload(event: any, field?: string, parameterIndex?: number, index?: number): void {
      if (event.target.files.length > 0) {
        const file = event.target.files[0] as File;
        const file_size = file.size;
        if (file_size <= 50000000) {
          this.getUrl(file, parameterIndex, index, field);
        } else {
          this.toastr.error("File size must be 50MB or smaller.");
        }
      }
    }
  
  

  async getUrl(file: File, parameterIndex?: number, index?: number, field?: string) {
    const reader = new FileReader();
    reader.onload = (event: any) => {
      const result = event.target.result;
  
      if (field === 'image' && parameterIndex !== undefined && index !== undefined) {
        this.getOptions(parameterIndex).at(index).patchValue({
          image: result,
          file: file
        });
        this.getOptions(parameterIndex).at(index).get('image')?.updateValueAndValidity();
      } else if (field === 'video' && parameterIndex !== undefined && index !== undefined) {
        this.getVideos(parameterIndex).at(index).patchValue({
          video: result,
          file: file
        });
        this.getVideos(parameterIndex).at(index).get('video')?.updateValueAndValidity();
      } else if (field === 'file' && index !== undefined) { //dataFile
        this.experiments.at(index).get('dataFile')?.patchValue({ dataFile: result });
        this.experiments.at(index).get('dataFile')?.updateValueAndValidity();
      } else if (field === 'video' && parameterIndex === undefined && index === undefined) { //introVideo
        this.introVideo.patchValue({
          video: result,
          file: file
        });
        this.introVideo.get('video')?.updateValueAndValidity();
      }
      else if (field === 'image' && parameterIndex === undefined && index === undefined) { //introPhoto
        this.introPhoto.patchValue({
          image: result,
          file: file
        });
        this.introPhoto.get('image')?.updateValueAndValidity();
      }
    };
  
    reader.onerror = (event: any) => {
      console.log('File could not be read: ' + event.target.error.code);
    };
    reader.readAsDataURL(file);
  }


  onSubmit(): void {

    this.createLab()
    /*if (this.newLaboratory.valid) {
    this.createLab()
    } else {
      this.toastr.error(
        'Please, complete the required Information',
        'Invalid action'
      );
    }*/
  }

  createLab(): void{
    const labFields = {
      "id": this.newLaboratory.value.id,
      "name": this.newLaboratory.value.info?.name,
      "institution":this.newLaboratory.value.info?.institution,
      "category":this.newLaboratory.value.info?.category,
      "instructor":this.newLaboratory.value.info?.instructor,
      "description":this.newLaboratory.value.introduction?.description,
      "video": this.newLaboratory.value.introduction?.introVideo?.file,
      "image": this.newLaboratory.value.introduction?.introPhoto?.file
    }
    this.labService.addLab(labFields as Laboratory).subscribe({
      next: (_: any) => {
        this.createLabGuides()
        this.createLabParameters()
        this.toastr.success(
          'Now you will be redirected to your new Laboratory!',
          this.newLaboratory.value.info?.name + " Successfully Created!"
        );
        //this.router.navigate(['/ultra-concurrent-rl', this.newLaboratory.value.id])
      },
      error: (e: any) => {
        console.log(e)
        this.toastr.error(
          'There was an error creating the lab. Please try later.'
        );
      },
    });
  }

  createLabGuides(): void{
    this.guides.value.forEach((guide: Guide)  => {
      const guideFields = {
        "title": guide.title,
        "url": guide.url,
        "laboratory": this.newLaboratory.value.id
      }
      this.labService.addLabGuide(guideFields as Guide).subscribe({
        next: (_: any) => {
         //Added Guide
        },
        error: (e: any) => {
          console.log(e)
          this.toastr.error(
            'There was an error creating the Lab Guides. Please try later.'
          );
        },
      });
    });    
  }

  createLabParameters(): void{
    //console.log(this.parameters.value)
    this.parameters.value.forEach((parameter: Parameter)  => {
      var options_array: { id: string; value: string; image: any; }[] = [] 
      parameter.parameter_options.forEach((option: Option) => {
        const option_fields ={
          "id": option.id,
          "value": option.value,
          "image": null,
        }
        options_array.push(option_fields)
      })
      const parameterFiels = {
        "name": parameter.name,
        "unit": parameter.unit,
        "laboratory": this.newLaboratory.value.id,
        "parameter_options": options_array
      }
      console.log(parameterFiels)
      this.labService.addLabParameter(parameterFiels).subscribe({
        next: (_: any) => {
         //Added Parameter
        },
        error: (e: any) => {
          console.log(e)
          this.toastr.error(
            'There was an error creating the Lab Parameters. Please try later.'
          );
        },
      });
    });
  }

  
}

