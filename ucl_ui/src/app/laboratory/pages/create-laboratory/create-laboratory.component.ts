import { Component, OnInit, Inject, inject, HostListener} from '@angular/core';
import { StepperOrientation } from '@angular/cdk/stepper';
import {Observable} from 'rxjs';
import {BreakpointObserver} from '@angular/cdk/layout';
import {map} from 'rxjs/operators';
import { FormBuilder,FormGroup,Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-laboratory',
  templateUrl: './create-laboratory.component.html',
  styleUrls: ['./create-laboratory.component.css']
})
export class CreateLaboratoryComponent implements OnInit {

  constructor( private builder:FormBuilder, private toastr: ToastrService,) {

      const breakpointObserver = inject(BreakpointObserver);
      this.stepperOrientation = breakpointObserver
        .observe('(min-width: 800px)')
        .pipe(map(({matches}) => (matches ? 'horizontal' : 'vertical')));
    
  }

  stepperOrientation: Observable<StepperOrientation>
  breakpoint: any

  defaultImg = '../../../../assets/emptyimage.jpeg';

  parameters=[{name: "default", options:[{name:"", photo:this.defaultImg}]}]
  

  ngOnInit():void {
    this.breakpoint = Math.floor(window.innerWidth / 200);
}

  onResize(event : any):void {
    this.breakpoint = Math.floor(event.target.innerWidth / 200);
  }

  categories = [
    {name: 'Physics'},
    {name: 'Biology'},
    {name: 'Chemistry'},
    {name: 'Electronics'},
    {name: 'Engineering'},
  ];


  newLaboratory=this.builder.group({
    info: this.builder.group({
      institution: this.builder.control("",Validators.required),
      name: this.builder.control("",Validators.required),
      category: this.builder.control("",Validators.required),
      description: this.builder.control("",Validators.required)
    }),
    parameters: this.builder.group({
      name: this.builder.control("",Validators.required),
      options: this.builder.control("",Validators.required),
    }),
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

  addParameter():void{
    this.parameters.push({name: "default",options:[{name:"", photo:this.defaultImg}]})
  }

  addOption(parameter:any):void{
    parameter.options.push({name:"", photo:this.defaultImg})
  }

  deleteOption(parameter:any, index:any):void{
    if (index !== -1) {
      parameter.options.splice(index, 1);
    }
  }

  deleteParameter(index:any):void{
    if (index !== -1) {
      this.parameters.splice(index, 1);
    }
  }
  

  onUploadFile(parameter:any ,event: any, index: number, field: string): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0] as File;
      const file_size = file.size;
      if (file_size <= 50000000) {
        //this.components[index][field] = file;
        this.getUrlFile(parameter,file, index);
      }
      else {
        this.toastr.error("File size must be 50MB or smaller.");
        //this.deleteComponent(index);
      }
    }
    
  }

  deleteComponent(index: number) {
    //return this.components.splice(index, 1);
  }

  async getUrlFile(parameter:any,file: any, index: number) {
    var reader = new FileReader();
    reader.onload = (event: any) => {
      parameter.options[index].photo = event.target.result;
    };
    reader.onerror = (event: any) => {
      console.log('File could not be read: ' + event.target.error.code);
    };

    reader.readAsDataURL(file);
  }
}
