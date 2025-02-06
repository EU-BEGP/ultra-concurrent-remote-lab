import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { Session } from '../../interfaces/session';
import { ToastrService } from 'ngx-toastr';
import { LaboratoryService } from '../../services/laboratory.service';
import { Laboratory } from '../../interfaces/laboratory';


@Component({
  selector: 'app-loaded-session',
  templateUrl: './loaded-session.component.html',
  styleUrls: ['./loaded-session.component.css']
})
export class LoadedSessionComponent implements OnInit {

  id = '';
  session!: Session | undefined
  laboratory!: Laboratory | undefined
  formattedDate = ''
  formattedTime = ''
  breakpoint: any
  labActivities!:any[]
  mergedLabActivities!:any[] 
  labExperiments!:any[]
  solvedActivities!:any[]
  mergedExperiments!:any[]
  testData:any[]=[[1,2,3],[1,2,3]]

  constructor(
    private route: ActivatedRoute,
    private sessionService: SessionService,
    private toastr: ToastrService,
    private router: Router,
     private labService: LaboratoryService
  ) {
    this.loadSessionInfo()
   }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.loadSessionInfo()
    });
    this.breakpoint = (window.innerWidth <= 900) ? 1 : 2;
  }

  onResize(event : any):void {
    this.breakpoint = (window.innerWidth <= 900) ? 1 : 2;
  }

  loadSessionInfo(): void{
    this.id = this.route.snapshot.params['id'];
    this.sessionService.getSessionById(this.id).subscribe({
      next: (session : any) => {
       this.session = session
       this.loadLabInfo(session.laboratory)
       this.loadLabActivities(session.laboratory)
       this.formattedDate=this.formatDate(session.registration_date)
       this.formattedTime=this.formatTime(session.registration_date)
      },
      error: (e: any) => {
        console.log(e)
        this.toastr.error(
          'There was an error getting the Session. Please try again later.'
        );
        this.router.navigateByUrl('');
      },
    });

  }

  loadSolvedActivities(){
    this.sessionService.getSolvedActivitiesById(this.id).subscribe({
      next: (solved_activities : any) => {
        this.solvedActivities=solved_activities
        this.mergedLabActivities = this.labActivities
        .filter(activity => 
          solved_activities.some((solved: { activity: any }) => solved.activity === activity.id)
        )
        .map(activity => {
          const solved = solved_activities.find((solved: { activity: any }) => solved.activity === activity.id);
      
          return {
            ...activity,
            solved: {
              ...solved,
              procedures: solved?.procedures.map((procedure: { data: string; }) => ({
                ...procedure,
                data: JSON.parse(procedure.data) // Convertimos el string en array/objeto
              })) || []
            }
          };
        });
      },
      error: (e: any) => {
        console.log(e)
        this.toastr.error(
          'There was an error getting the Session. Please try again later.'
        );
      },
    });
  }

  getConvertedData(data: any): any {
    console.log(JSON.parse(data))
    return JSON.parse(data);
  }

  loadLabActivities(labId:string){
    this.labService.getLabActivities(labId).subscribe({
      next: (lab_activities : any) => {
        this.labActivities = lab_activities
        this.loadSolvedActivities()
        this.loadLabExperiments(labId)
      },
      error: (e: any) => {
        console.log(e)
        this.toastr.error(
          'There was an error getting the Session. Please try again later.'
        );
      },
    });
  }
  

  loadLabExperiments(labId: string) {
    this.labService.getLabExperiments(labId).subscribe({
      next: async (lab_experiments: any) => {
        try {
          const experimentActivitiesPromises = lab_experiments.map(async (experiment: any) => {
            const experiment_activities = await this.labService.getActivitiesByExperimentId(experiment.id).toPromise();
            
            experiment.activities = experiment_activities.map((activity: any) => {
              const solvedActivity = this.solvedActivities.find((solved: any) => solved.activity === activity.id);
              if (solvedActivity) {
                activity.solved = {
                  ...solvedActivity,
                  procedures: solvedActivity.procedures.map((procedure: any) => ({
                    ...procedure,
                    data: JSON.parse(procedure.data) // Convertimos el campo data a JSON
                  }))
                };
              }
              return activity;
            });
  
            return experiment;
          });
  
          this.labExperiments = await Promise.all(experimentActivitiesPromises);
        } catch (e) {
          console.log(e);
          this.toastr.error('There was an error processing the activities. Please try again later.');
        }
      },
      error: (e: any) => {
        console.log(e);
        this.toastr.error('There was an error getting the lab experiments. Please try again later.');
      },
    });
  }


  loadLabInfo(id:string):void{

    this.labService.getLabById(id).subscribe({
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

}

formatDate(date: string): string {
  const parsedDate = new Date(date);
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0'); // Meses de 0-11
  const day = String(parsedDate.getDate()).padStart(2, '0');
  const year = parsedDate.getFullYear();
  return `${month}-${day}-${year}`;
}

private formatTime(date: string): string {
  const parsedDate = new Date(date);
  const hours = String(parsedDate.getHours()).padStart(2, '0');
  const minutes = String(parsedDate.getMinutes()).padStart(2, '0');
  const seconds = String(parsedDate.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
}
