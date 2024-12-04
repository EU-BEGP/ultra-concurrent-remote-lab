import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, Inject, inject, ViewChild, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { Guide } from '../../interfaces/guide';
import { Laboratory } from '../../interfaces/laboratory';
import { LaboratoryService } from '../../services/laboratory.service';
import { Observable } from 'rxjs';
import { Option } from '../../interfaces/option';
import { Parameter } from '../../interfaces/parameter';
import { Router } from '@angular/router';
import { StepperOrientation } from '@angular/cdk/stepper';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/core/auth/interfaces/user';
import { UserService } from 'src/app/core/auth/services/user.service';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { Experiment } from '../../interfaces/experiment';
import { Activity } from '../../interfaces/activity';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-create-laboratory',
  templateUrl: './create-laboratory.component.html',
  styleUrls: ['./create-laboratory.component.css']
})
export class CreateLaboratoryComponent implements OnInit {
  @ViewChild('videoPlayer') videoplayer!: ElementRef;
  @ViewChild(MatStepper) stepper!: MatStepper;
  stepperOrientation: Observable<StepperOrientation>
  breakpoint: any
  breakpointVideo: any
  breakpointOption: any
  videoRowHeight: any
  defaultImg = '../../../../assets/emptyimage.jpeg';
  defaultVideo = '../../../../assets/empty_video.mp4';
  categories = [
    { name: 'Photovoltaic Energy' },
    { name: 'Thermal Energy' },
    { name: 'Spectometry' },
    { name: 'Wind Energy' },
    { name: 'Hydraulic Energy' },
    { name: 'Other' },
  ];
  currentUserId: any = 0;

  constructor(private builder: FormBuilder, private toastr: ToastrService, private router: Router, private userService: UserService, private labService: LaboratoryService) {
    const breakpointObserver = inject(BreakpointObserver);
    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
  
  }

  ngOnInit(): void {

    this.videoRowHeight = window.innerWidth <= 600 ? 340 : 380
    this.breakpoint = Math.floor(window.innerWidth / 260);
    this.breakpointVideo = Math.floor((window.innerWidth / 400) / 2);
    this.breakpointOption = Math.floor(window.innerWidth / 400);
    this.parameters.valueChanges.subscribe(() => {
      this.syncSelectedOptionsWithParameters();
    });
    this.getCurrentUserId();
  }

  getCurrentUserId() {
    this.userService.getUserData().subscribe((response: User) => {
      this.newLaboratory.get('info')?.get('instructor')?.setValue(response.id!);
    });
  }
  
  onResize(event: any): void {
    this.breakpoint = Math.floor(event.target.innerWidth / 260);
  }

  onResizeParameter(event: any): void {
    this.videoRowHeight = window.innerWidth <= 600 ? 340 : 380
    this.breakpointOption = Math.floor(window.innerWidth / 400);
    this.breakpointVideo = Math.floor((event.target.innerWidth / 400) / 2);
  }

  newLaboratory = this.builder.group({
    id: [uuidv4()],
    info: this.builder.group({
      instructor: 0,
      institution: this.builder.control('', Validators.required),
      name: this.builder.control('', Validators.required),
      category: this.builder.control('', Validators.required),
    }),
    introduction: this.builder.group({
      description: this.builder.control('', Validators.required),
      introPhoto: this.builder.group({
        image: [this.defaultImg],
        file: ['']
      }),
      introVideo: this.builder.group({
        video: [this.defaultVideo],
        file: this.builder.control('', this.fileRequiredValidator())
      }),
      guides: new FormArray([
        this.builder.group({
          title: this.builder.control('', Validators.required),
          url:  this.builder.control('', [Validators.required,  Validators.pattern(
            '^(https?|ftp):\\/\\/(([^:/\\s]+)(:[0-9]+)?)(\\/[^#\\s]*)?(\\?[^#\\s]*)?(#.*)?$'
          )])
        })
      ]),
    }),
    parameters: this.builder.array([
      this.builder.group({
        name: this.builder.control('', Validators.required),
        unit: this.builder.control('', Validators.required),
        parameter_options: new FormArray([this.builder.group({
          id: [uuidv4()],
          value: [''],
          image: [this.defaultImg],
          file: ['']
        }
        )])
      })
    ]),
    experiments: this.builder.array([this.builder.group({
      id: [uuidv4()],
      selectedOptions: new FormArray([this.builder.control('', Validators.required)]),
      videos: new FormArray([this.builder.group({
        name: this.builder.control('', Validators.required),
        video: [this.defaultVideo],
        file: this.builder.control('', this.fileRequiredValidator())
      })]),
      activities: new FormArray([
        this.builder.group({
          id: [uuidv4()],
          statement:  this.builder.control('', Validators.required),
          result: [''],
          result_unit: ['']
        })
      ]),
      data_file: this.builder.control('')
    })]),
    activities: this.builder.array([
      this.builder.group({
        id: [uuidv4()],
        statement:  this.builder.control('', Validators.required),
        result: [''],
        result_unit: ['']
      })
    ])
  })

  fileRequiredValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const file = control.value;
      return file ? null : { required: true };
    };
  }

  get introPhoto() {
    return this.newLaboratory.get('introduction')?.get('introPhoto') as FormGroup
  }

  get introVideo(): FormGroup {
    return this.newLaboratory.get('introduction')?.get('introVideo') as FormGroup
  }

  get info(): FormGroup {
    return this.newLaboratory.get('info') as FormGroup
  }

  get introduction(): FormGroup {
    return this.newLaboratory.get('introduction') as FormGroup
  }
  get guides(): FormArray {
    return this.newLaboratory.get('introduction')?.get('guides') as FormArray
  }

  deleteGuide(index: any): void {
    this.guides.removeAt(index)
  }

  addGuide(): void {
    const guideFormGroup = this.builder.group({
      title: this.builder.control('', Validators.required),
      url: this.builder.control('', [Validators.required,  Validators.pattern(
        '^(https?|ftp):\\/\\/(([^:/\\s]+)(:[0-9]+)?)(\\/[^#\\s]*)?(\\?[^#\\s]*)?(#.*)?$'
      )])
    })
    this.guides.push(guideFormGroup)
  }

  get parameters(): FormArray {
    return this.newLaboratory.get('parameters') as FormArray
  }

  addParameter(): void {
    const parametersFormGroup = this.builder.group({
      name:  this.builder.control('', Validators.required),
      unit: [''],
      parameter_options: new FormArray([this.builder.group({
        id: [uuidv4()],
        value: this.builder.control('', Validators.required),
        image: [this.defaultImg],
        file: ['']
      }
      )])
    })
    this.parameters.push(parametersFormGroup)
  }

  getOptions(index: number) {
    return this.parameters.at(index).get('parameter_options') as FormArray
  }

  addOption(index: number): void {
    const optionFormGroup = this.builder.group({
      id: [uuidv4()],
      value:  this.builder.control('', Validators.required),
      image: [this.defaultImg],
      file: ['']
    })
    this.getOptions(index).push(optionFormGroup)
  }

  deleteOption(index: number, optionIndex: number): void {
    this.getOptions(index).removeAt(optionIndex)
  }

  deleteParameter(index: any): void {
    this.parameters.removeAt(index)
  }

  get experiments(): FormArray {
    return this.newLaboratory.get('experiments') as FormArray
  }

  deleteExperiment(index: any): void {
    this.experiments.removeAt(index)
  }

  addExperiment(): void {

    const selectedOptionsArray = this.builder.array([]);
    this.parameters.controls.forEach(() => {
      selectedOptionsArray.push(this.builder.control('', Validators.required));
    });

    this.experiments.push(this.builder.group({
      id: [uuidv4()],
      selectedOptions: selectedOptionsArray,
      videos: new FormArray([this.builder.group({
        name:  this.builder.control('', Validators.required),
        video: [this.defaultVideo],
        file: this.builder.control('', this.fileRequiredValidator()),
      })]),
      activities: new FormArray([
        this.builder.group({
          statement:  this.builder.control('', Validators.required),
          result: [''],
          result_unit: ['']
        })
      ]),
      data_file: this.builder.control('')
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

  getVideos(index: number) {
    return this.experiments.at(index).get('videos') as FormArray
  }

  addVideo(index: number): void {
    const videoFormGroup = this.builder.group({
      name:  this.builder.control('', Validators.required),
      video: [this.defaultVideo],
      file: this.builder.control('', this.fileRequiredValidator())
    })
    this.getVideos(index).push(videoFormGroup)
  }
  deleteVideo(index: number, videoIndex: number): void {
    this.getVideos(index).removeAt(videoIndex)
  }

  getExperimentActivites(index: number) {
    return this.experiments.at(index).get('activities') as FormArray
  }


  addExperimentActivity(index: number): void {
    const activityFormGroup = this.builder.group({
      statement:  this.builder.control('', Validators.required),
      result: [''],
      result_unit: ['']
    })
    this.getExperimentActivites(index).push(activityFormGroup)
  }

  deleteExperimentActivity(index: number, activityIndex: number): void {
    this.getExperimentActivites(index).removeAt(activityIndex)
  }

  get activities(): FormArray {
    return this.newLaboratory.get('activities') as FormArray
  }

  deleteActivity(index: any): void {
    this.activities.removeAt(index)
  }

  addActivity(): void {
    const activityFormGroup = this.builder.group({
      statement:  this.builder.control('', Validators.required),
      result: [''],
      result_unit: ['']
    })
    this.activities.push(activityFormGroup)
  }

  getDataFile(index: number) {
    return this.experiments.at(index).get('data_file') as FormControl
  }



  onUpload(event: any, field?: string, parameterIndex?: number, index?: number): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0] as File;
      const file_size = file.size;
      if (file_size <= 75000000) {
        this.getUrl(file, parameterIndex, index, field);
      } else {
        this.toastr.error('File size must be 75MB or smaller.');
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
        this.experiments.at(index).get('data_file')?.patchValue({ data_file: file });
        this.experiments.at(index).get('data_file')?.updateValueAndValidity();
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

    if (this.newLaboratory.valid) {
    this.createLab()
    } else {
      this.toastr.error(
        'Please, complete the required Information',
        'Invalid action'
      );
    }
  }

  createLab(): void {
    const labFields = {
      'id': this.newLaboratory.value.id,
      'name': this.newLaboratory.value.info?.name,
      'institution': this.newLaboratory.value.info?.institution,
      'category': this.newLaboratory.value.info?.category,
      'instructor': this.newLaboratory.value.info?.instructor,
      'description': this.newLaboratory.value.introduction?.description,
      'video': this.newLaboratory.value.introduction?.introVideo?.file,
      'image': this.newLaboratory.value.introduction?.introPhoto?.file
    }
    this.labService.addLab(labFields as Laboratory).subscribe({
      next: (_: any) => {
        this.createLabGuides()
        this.createLabParameters()
        this.createLabExperiments()
        this.createLabActivities()
        this.toastr.success(
          'Now you will be redirected to your new Laboratory!',
          this.newLaboratory.value.info?.name + ' Successfully Created!'
        );
        this.router.navigate(['/ultra-concurrent-rl', this.newLaboratory.value.id])
      },
      error: (e: any) => {
        console.log(e)
        this.toastr.error(
          'There was an error creating the lab. Please try later.'
        );
      },
    });
  }

  createLabGuides(): void {
    this.guides.value.forEach((guide: Guide) => {
      const guideFields = {
        'title': guide.title,
        'url': guide.url,
        'laboratory': this.newLaboratory.value.id
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

  createLabParameters(): void {
    this.parameters.value.forEach((parameter: Parameter) => {
      var options_array: { id: string; value: string; image: any; }[] = []
      parameter.parameter_options.forEach((option: Option) => {
        const option_fields = {
          'id': option.id,
          'value': option.value,
          'image': option.file,
        }
        options_array.push(option_fields)
      })
      const parameterFields = {
        'name': parameter.name,
        'unit': parameter.unit,
        'laboratory': this.newLaboratory.value.id,
        'parameter_options': options_array
      }
      this.labService.addLabParameter(parameterFields).subscribe({
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

  createLabExperiments(): void {
    this.experiments.value.forEach((experiment: Experiment) => {
     
      const experimentFields = {
        'id': experiment.id,
        'name': experiment.name,
        'laboratory': this.newLaboratory.value.id,
        'parameter_options': experiment.selectedOptions,
        'experiment_videos': experiment.videos,
        'data_file':experiment.data_file
      }
      this.labService.addLabExperiment(experimentFields).subscribe({
        next: (_: any) => {
          //Added Experiment
          experiment.activities.forEach((activity: any) => {
            const activityFields = {
                'statement': activity.statement,
                'expected_result': activity.result,
                'result_unit': activity.result_unit,
                'experiment': experiment.id
              }

            this.labService.addExperimentActivities(activityFields).subscribe({
              next: (_: any) => {
                //Added Activity
              },
              error: (e: any) => {
                console.log(e)
                this.toastr.error(
                  'There was an error creating the Experiment Activities. Please try later.'
                );
              },
            });
          });
        },
        error: (e: any) => {
          console.log(e)
          this.toastr.error(
            'There was an error creating the Lab Experiments. Please try later.'
          );
        },
      });
    });
  }

  createLabActivities(): void {
    this.activities.value.forEach((activity: any) => {
      const activityFields = {
        'statement': activity.statement,
        'expected_result': activity.result,
        'result_unit': activity.result_unit,
        'laboratory': this.newLaboratory.value.id,
      }
      this.labService.addActivities(activityFields).subscribe({
        next: (_: any) => {
          //Added Activities
        },
        error: (e: any) => {
          console.log(e)
          this.toastr.error(
            'There was an error creating the Activities. Please try later.'
          );
        },
      });
    });
  }
  nextStepIntroduction() {
    if (this.introduction.valid) {
      this.stepper.next(); 
    } else {
      this.introduction.markAllAsTouched(); 
    }
  }

  nextStepExperiments() {
    if (this.experiments.valid) {
      this.stepper.next(); 
    } else {
      this.experiments.markAllAsTouched(); 
    }
  }
}

