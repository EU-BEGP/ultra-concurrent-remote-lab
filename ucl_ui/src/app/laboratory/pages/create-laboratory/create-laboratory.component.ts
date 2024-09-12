import { Component, OnInit, Inject, inject, HostListener} from '@angular/core';
import { StepperOrientation } from '@angular/cdk/stepper';
import {Observable} from 'rxjs';
import {BreakpointObserver} from '@angular/cdk/layout';
import {map} from 'rxjs/operators';
import { FormArray, FormBuilder,FormGroup,Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-laboratory',
  templateUrl: './create-laboratory.component.html',
  styleUrls: ['./create-laboratory.component.css']
})
export class CreateLaboratoryComponent implements OnInit {

  stepperOrientation: Observable<StepperOrientation>
  breakpoint: any
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
}

  onResize(event : any):void {
    this.breakpoint = Math.floor(event.target.innerWidth / 200);
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
            value: [''], 
            photo: [this.defaultImg]
          }
        )])
      })
    ]),
    experiments: this.builder.group({
      parameters: this.builder.control("",Validators.required),
      video: this.builder.control("",Validators.required),
      name: this.builder.control("",Validators.required),

    }),
    activities: this.builder.group({
      result: this.builder.control("",Validators.required),
      description: this.builder.control("",Validators.required),
    })
  })


  get parameters():FormArray {
    return this.newLaboratory.get('parameters') as FormArray
  }

  addParameter():void{
    const parametersFormGroup = this.builder.group({
      name: [''], 
      options: new FormArray([this.builder.group({
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
          value: [''], 
          photo: [this.defaultImg]
      })
    this.getOptions(index).push(optionFormGroup)
    console.log(this.getOptions(index).value)
  }

  deleteOption(index:number, optionIndex:number):void{
   this.getOptions(index).removeAt(optionIndex)
  }

  deleteParameter(index:any):void{
  this.parameters.removeAt(index)
}
  

  onUploadFile(event: any,parameterIndex:number, index: number, field: string): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0] as File;
      const file_size = file.size;
      if (file_size <= 50000000) {
        this.getUrlFile(file,parameterIndex, index);
      }
      else {
        this.toastr.error("File size must be 50MB or smaller.");
      }
    }
    
  }

  async getUrlFile(file: any,parameterIndex:number, index: number) {
    var reader = new FileReader();
    reader.onload = (event: any) => {
      console.log(this.getOptions(parameterIndex).value)
      this.getOptions(parameterIndex).at(index).patchValue({
        photo:event.target.result
      })
      this.getOptions(parameterIndex).at(index).get('photo')?.updateValueAndValidity();
    };
    reader.onerror = (event: any) => {
      console.log('File could not be read: ' + event.target.error.code);
    };

    reader.readAsDataURL(file);
  }
}
