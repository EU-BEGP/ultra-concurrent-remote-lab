import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, Inject, inject, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { UploadOptionsDialogComponent } from '../../components/upload-options-dialog/upload-options-dialog.component';
import { BookingService } from '../../services/booking.service';
import { ProcedureToolsDialogComponent } from '../../components/procedure-tools-dialog/procedure-tools-dialog.component';
import Handsontable from 'handsontable';
import { forkJoin } from 'rxjs';
import { Group } from 'src/app/core/auth/enums/group';


@Component({
  selector: 'app-create-laboratory',
  templateUrl: './create-laboratory.component.html',
  styleUrls: ['./create-laboratory.component.css']
})
export class CreateLaboratoryComponent implements OnInit {
  @ViewChild('videoPlayer') videoplayer!: ElementRef;
  @ViewChild(MatStepper) stepper!: MatStepper;
  @ViewChild('intro_video_input') intro_video_input!: ElementRef<HTMLInputElement>;
  @ViewChild('experiment_media_input') experiment_media_input!: ElementRef<HTMLInputElement>;
  stepperOrientation: Observable<StepperOrientation>
  breakpoint: any
  breakpointVideo: any
  breakpointOption: any
  videoRowHeight: any
  defaultImg = 'assets/emptyimage.jpeg';
  defaultVideo = 'assets/emptyimage.jpeg';
  categories = [
    { name: 'Photovoltaic Energy' },
    { name: 'Thermal Energy' },
    { name: 'Spectometry' },
    { name: 'Wind Energy' },
    { name: 'Hydraulic Energy' },
    { name: 'Other' },
  ];

  currentUserId: any = 0;

  constructor(private builder: FormBuilder, 
    private toastr: ToastrService, 
    private router: Router, 
    private userService: UserService, 
    private labService: LaboratoryService,  
    private dialogRef: MatDialog,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) {
    const breakpointObserver = inject(BreakpointObserver);
    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
  
  }

  ngOnInit(): void {
  this.videoRowHeight = window.innerWidth <= 600 ? 340 : 380;
  this.breakpoint = Math.floor(window.innerWidth / 260);
  this.breakpointVideo = Math.floor((window.innerWidth / 400) / 2);
  this.breakpointOption = Math.floor(window.innerWidth / 400);
  this.parameters.valueChanges.subscribe(() => {
    this.syncSelectedOptionsWithParameters();
  });
  
  this.userService.getUserData().subscribe(() => {
    this.userService.currentUser$.subscribe(user => {
      if (!user) return; // 👈 ignorar el null inicial

      if (!(user.groups?.some(g => g.name === Group.Instructors))) {
        this.toastr.info('You are not authorized to create a laboratory');
        this.router.navigateByUrl('');
      } else {
        this.getCurrentUserId();
      }
    });
  });
}

  getCurrentUserId() {
    const user = this.userService['currentUserSubject'].value; // valor actual del BehaviorSubject
    if (user?.id) {
      this.newLaboratory.get('info')?.get('instructor')?.setValue(user.id);
    }
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
        file: this.builder.control('', this.fileRequiredValidator()),
        youtube_video:['']
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
        unit: [''],
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
        media: [this.defaultImg],
        file: this.builder.control('', this.fileRequiredValidator()),
        youtube_video:[''],
      })]),
      activities: this.builder.array([]),
      data_file: this.builder.control('')
    })]),
    activities: this.builder.array([
      this.builder.group({
        id: [uuidv4()],
        statement:  this.builder.control('', Validators.required),
        procedures: this.builder.array([]),
        possible_answers: this.builder.array([]),
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

  isVideo(media: any): boolean {
    
    return media && ( media.match(/\.(mp4|mov|avi|mkv)$/i) || media.startsWith('data:video/') || media.includes('youtube.com') || media.includes('youtu.be'));
  }
  
  isImage(media: any): boolean {
    return media && ( media.match(/\.(jpg|jpeg|png|gif)$/i) || media.startsWith('data:image/'));
  }

  copyActivity(experimentIndex: number, activityIndex: number) {
    const experimentsArray = this.experiments
    
    if (experimentIndex > 0) { 
        const previousExperiment = experimentsArray.at(experimentIndex - 1) as FormGroup;
        const currentExperiment = experimentsArray.at(experimentIndex) as FormGroup;

        const previousActivities = previousExperiment.get('activities') as FormArray;
        const currentActivities = currentExperiment.get('activities') as FormArray;

        if (activityIndex < previousActivities.length) { 
          const previousStatement = previousActivities.at(activityIndex).get('statement')?.value;

            currentActivities.at(activityIndex).patchValue({ statement: previousStatement });
        }
    }
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
        media: [this.defaultImg],
        file: this.builder.control('', this.fileRequiredValidator()),
        youtube_video:[''],
      })]),
      activities: new FormArray([
        this.builder.group({
          statement:  this.builder.control('', Validators.required),
          result: [''],
          procedures: this.builder.array([]),
          possible_answers: this.builder.array([]),
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
      media: [this.defaultImg],
      file: this.builder.control('', this.fileRequiredValidator()),
      youtube_video:[''],
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
      procedures: this.builder.array([]),
      possible_answers: this.builder.array([]),
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
      procedures: this.builder.array([]),
      possible_answers: this.builder.array([]),
      result_unit: ['']
    })
    this.activities.push(activityFormGroup)
  }

  getExperimentActivityProcedures(experimentIndex:number ,activityIndex: number) {
    return this.getExperimentActivites(experimentIndex).at(activityIndex).get('procedures') as FormArray;
  }

  addExperimentProcedureTable(experimentIndex: number, activityIndex: number, data_type: string) {
    const procedureArray = this.getExperimentActivityProcedures(experimentIndex, activityIndex);
    
    procedureArray.push(this.builder.group({
      data: [Handsontable.helper.createSpreadsheetData(5, 2)], 
      data_headers: [['C 1', 'C 2']],
      data_type: data_type
    }));

  }

  
  addExperimentActivityPossibleAnswer(experimentIndex: number, activityIndex: number) {
    const possible_answers_array = this.getExperimentActivityPossibleAnswers(experimentIndex, activityIndex);
    
    possible_answers_array.push(this.builder.control('', Validators.required),)

  }

  
  getExperimentActivityPossibleAnswers(experimentIndex:number ,activityIndex: number) {
    return this.getExperimentActivites(experimentIndex).at(activityIndex).get('possible_answers') as FormArray;
  }


  onExperimentTableDataChange(experimentIndex: number, activityIndex: number, procedureIndex: number, newData: any) {
    const procedure = this.getExperimentActivityProcedures(experimentIndex, activityIndex).at(procedureIndex)
    if (procedure) {
      procedure.get('data')?.setValue(JSON.parse(JSON.stringify(newData.data)));
      procedure.get('data_headers')?.setValue(JSON.parse(JSON.stringify(newData.headers)));
      this.cdr.detectChanges(); 
    }
  }

  removeExperimentActivityProcedure(experimentIndex: number, activityIndex: number, procedureIndex: number) {
    const procedures = this.getExperimentActivityProcedures(experimentIndex, activityIndex);
    procedures.removeAt(procedureIndex);
  }

   removeExperimentActivityPossibleAnswers(experimentIndex: number, activityIndex: number, answerIndex: number) {
    const answers = this.getExperimentActivityPossibleAnswers(experimentIndex, activityIndex);
    answers.removeAt(answerIndex);
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
    if (data.experiment_index !== undefined && data.experiment_index !== null) {//if its a Experiment Activity
      if(selectedProcedureType == "Time-Line"){
        this.addExperimentProcedureTable(data.experiment_index,data.activityIndex, "chart")
      }
      else if(selectedProcedureType == "Dynamic Tables"){
        this.addExperimentProcedureTable(data.experiment_index,data.activityIndex, "table")
      }
    }else{ //if its a Final Activity
      if(selectedProcedureType == "Time-Line"){
        this.addProcedureTable(data.activityIndex, "chart")
      } else if(selectedProcedureType == "Dynamic Tables"){
        this.addProcedureTable(data.activityIndex, "table")
      }
    }
  }

  addProcedureTable(activityIndex: number, data_type:string) {
    const procedureArray = this.activities.at(activityIndex).get('procedures') as FormArray;
    
    procedureArray.push(this.builder.group({
      data: [Handsontable.helper.createSpreadsheetData(5, 2)], 
      data_headers: [['C 1', 'C 2']],
      data_type: data_type
    }));
  }

   addPossibleAnswer(activityIndex: number) {
    const answers = this.activities.at(activityIndex).get('possible_answers') as FormArray;
    
    answers.push(this.builder.control('', Validators.required),);
  }

  getDataFile(index: number) {
    return this.experiments.at(index).get('data_file') as FormControl
  }

  onTableDataChange(activityIndex: number, procedureIndex: number, newData: any) {
    const procedure = this.getFinalActivityProcedures(activityIndex).at(procedureIndex);
    if (procedure) {
      procedure.get('data')?.setValue(JSON.parse(JSON.stringify(newData.data)));
      procedure.get('data_headers')?.setValue(JSON.parse(JSON.stringify(newData.headers)));
      this.cdr.detectChanges(); 
    }
  }

  getFinalActivityProcedures(activityIndex: number) {
    return this.activities.at(activityIndex).get('procedures') as FormArray;
  }

   getFinalActivityPossibleAnswers(activityIndex: number) {
    return this.activities.at(activityIndex).get('possible_answers') as FormArray;
  }

  removePossibleAnswer(activityIndex: number, answerIndex: number) {
    const possible_answers = this.getFinalActivityPossibleAnswers(activityIndex);
    possible_answers.removeAt(answerIndex);
  }
  
  removeProcedure(activityIndex: number, procedureIndex: number) {
    const procedures = this.getFinalActivityProcedures(activityIndex);
    procedures.removeAt(procedureIndex);
  }

  onUpload(event: any, parameterIndex?: number, index?: number, source?: string): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0] as File;
      const file_size = file.size;
      if (file_size <= 75000000) {
        this.getUrl(file, parameterIndex, index, source);
      } else {
        this.toastr.error('File size must be 75MB or smaller.');
      }
    }
  }

  trackByFn(index: number, item: AbstractControl) {
    return item.value?.id || index;
}

async getUrl(file: File, parameterIndex?: number, index?: number, source?: string) {
  const reader = new FileReader();

  reader.onload = (event: any) => {
    const result = event.target.result;

    // Detectar el tipo de archivo
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    const isImage = fileType.startsWith('image/');
    const isVideo = fileType.startsWith('video/');
    const isDataFile = /\.(dat|csv|xls|xlsx)$/i.test(fileName);

    // Función para actualizar un FormArray
    const patchFormArray = (formArray: any, key: string) => {
      if (parameterIndex !== undefined && index !== undefined) {
        formArray(parameterIndex).at(index).patchValue({
          [key]: result,
          file: file
        });
        formArray(parameterIndex).at(index).get(key)?.updateValueAndValidity();
      }
    };

    if (isImage) {
      if (parameterIndex === undefined && index === undefined) {
        // introPhoto
        this.introPhoto.patchValue({ image: result, file: file });
        this.introPhoto.get('image')?.updateValueAndValidity();
      } else if (source === 'options') {
        // Si proviene de options
        patchFormArray(this.getOptions.bind(this), 'image');
      } else if (source === 'videos') {
        // Si proviene de videos
        patchFormArray(this.getVideos.bind(this), 'media');
      }
    } else if (isVideo) {
      if (parameterIndex === undefined && index === undefined) {
        // introVideo
        this.introVideo.patchValue({ video: result, file: file });
        this.introVideo.get('video')?.updateValueAndValidity();
      } else {
        // Media en experiments
        patchFormArray(this.getVideos.bind(this), 'media');
      }
    } else if (isDataFile && index !== undefined) {
      // data_file en experiments
      this.experiments.at(index).get('data_file')?.patchValue({ data_file: file });
      this.experiments.at(index).get('data_file')?.updateValueAndValidity();
    }
  };

  reader.onerror = (event: any) => {
    console.error('File could not be read: ' + event.target.error.code);
  };

  reader.readAsDataURL(file);
}


  openUploadOptions(video_type:string, video_input?:HTMLInputElement, experiment_index?:any, video_index?:any){
    const dialogRef = this.dialogRef.open(UploadOptionsDialogComponent, {
      width: '50vw'
      })    
      dialogRef.componentInstance.selectedOption.subscribe((parameters:any) => {
        if(parameters.type == "File"){
          if(video_type == "experiment_media"){
            video_input!.click();
          }else{//intro_video
            this.intro_video_input.nativeElement.click();
          }
        } else if (parameters.type == "Youtube"){
          if(video_type == "experiment_media"){
            this.getVideos(experiment_index).at(video_index).patchValue({
              media: parameters.url,
              file: parameters.url,
              youtube_video: parameters.url
            });
            this.getVideos(experiment_index).at(video_index).get('video')?.updateValueAndValidity();
          }else{//intro_video
            this.introVideo.patchValue({
              video: parameters.url,
              file: parameters.url,
              youtube_video: parameters.url,
            });
            this.introVideo.get('video')?.updateValueAndValidity();
          }
        }
    });
  
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

    const labFields: any = {
      'id': this.newLaboratory.value.id,
      'name': this.newLaboratory.value.info?.name,
      'institution': this.newLaboratory.value.info?.institution,
      'category': this.newLaboratory.value.info?.category,
      'instructor': this.newLaboratory.value.info?.instructor,
      'description': this.newLaboratory.value.introduction?.description,
      'image': this.newLaboratory.value.introduction?.introPhoto?.file
    };
    
    const youtubeVideo = this.newLaboratory.value.introduction?.introVideo?.youtube_video;
    const fileVideo = this.newLaboratory.value.introduction?.introVideo?.file;
    
    if (youtubeVideo && youtubeVideo.trim() !== '') {
      labFields.youtube_video = youtubeVideo;
    } else {
      labFields.video = fileVideo;
    }

    this.labService.addLab(labFields as Laboratory).subscribe({
      next: (_: any) => {
        this.createLabGuides()
        this.createLabParameters()
        this.createLabActivities()
        //this.createLabBook4RL()
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

  createLabBook4RL(): void {
   
      const labFields: any = {
        'name': this.newLaboratory.value.info?.name,
        'instructor': this.newLaboratory.value.info?.instructor,
        'university': this.newLaboratory.value.info?.institution,
        'course': this.newLaboratory.value.info?.category,
        'type': "Ultra Concurrent",
        'image': this.newLaboratory.value.introduction?.introPhoto?.file,
        'url':"http://localhost:4200/ultra-concurrent-rl/"+this.newLaboratory.value.id,
        'description': this.newLaboratory.value.introduction?.description,
        'visible': "1",
        'notify_owner':"0"
      };

      this.bookingService.addLab(labFields as Guide).subscribe({
        next: (_: any) => {

        },
        error: (e: any) => {
          console.log(e)
          this.toastr.error(
            'There was an error creating the lab in Book4RL. Please try later.'
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
    const requests = this.parameters.value.map((parameter: Parameter) => {
      const options_array = parameter.parameter_options.map((option: Option) => ({
        id: option.id,
        value: option.value,
        image: option.file
      }));

      const parameterFields = {
        name: parameter.name,
        unit: parameter.unit,
        laboratory: this.newLaboratory.value.id,
        parameter_options: options_array
      };

      return this.labService.addLabParameter(parameterFields); 
    });

    forkJoin(requests).subscribe({
      next: (_results) => {
        
        this.createLabExperiments(); 
      },
      error: (e) => {
        console.log(e);
        this.toastr.error(
          'There was an error creating the Lab Parameters. Please try later.'
        );
      }
    });
}

  createLabExperiments(): void {
    this.experiments.value.forEach((experiment: Experiment) => {
     
      const experimentFields = {
        'id': experiment.id,
        'name': experiment.name,
        'laboratory': this.newLaboratory.value.id,
        'parameter_options': experiment.selectedOptions,
        'experiment_media': experiment.videos,
        'data_file':experiment.data_file
      }
      this.labService.addLabExperiment(experimentFields).subscribe({
        next: (_: any) => {
          //Added Experiment
          experiment.activities.forEach((activity: any) => {
            const activityFields = {
                'statement': activity.statement,
                'procedures': activity.procedures,
                'possible_answers': activity.possible_answers,
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
        'procedures': activity.procedures,
        'possible_answers': activity.possible_answers,
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

