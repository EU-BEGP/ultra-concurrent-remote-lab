import config from '../../config.json';
import { Guide } from '../interfaces/guide';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http'; import { Observable, lastValueFrom, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { Laboratory } from '../interfaces/laboratory';
import { Parameter } from '../interfaces/parameter';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';
import { Activity } from '../interfaces/activity';
import { Experiment } from '../interfaces/experiment';

@Injectable({
  providedIn: 'root',
})


export class LaboratoryService {
  private httpOptions = <any>{};
  constructor(private http: HttpClient, private toastr: ToastrService) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      observe: 'response' as 'response',
    };
  }

  getLabs(owner : boolean): Observable<any> {
    if(owner){
      let params = new HttpParams();
      params = params.append('owned', owner)
      return this.http.get<Laboratory[]>(`${config.api.baseUrl}ucl/laboratories/` , { params });
    } else {
      return this.http.get<Laboratory[]>(`${config.api.baseUrl}ucl/laboratories/`);
    }
  }

  getLabById(id: string): Observable<any> {
    return this.http.get<Laboratory>(`${config.api.baseUrl}ucl/laboratories/${id}/`);
  }

  deleteLab(id: string): Observable<any> {
    return this.http.delete<Laboratory>(`${config.api.baseUrl}ucl/laboratories/${id}/`);
  }

  getLabGuides(id: string): Observable<any> {
    return this.http.get<Guide[]>(`${config.api.baseUrl}ucl/laboratories/${id}/guides/`);
  }

  getLabParameters(id: string): Observable<any> {
    return this.http.get<Parameter[]>(`${config.api.baseUrl}ucl/laboratories/${id}/parameters/`);
  }

  getLabSessions(id: string): Observable<any> {
    return this.http.get<Parameter[]>(`${config.api.baseUrl}ucl/laboratories/${id}/sessions/`);
  }

  getActivitiesByExperimentId(id: string): Observable<any> {
    return this.http.get<Activity[]>(`${config.api.baseUrl}ucl/experiments/${id}/activities/`);
  }

  getLabActivities(id: string): Observable<any> {
    return this.http.get<Activity[]>(`${config.api.baseUrl}ucl/laboratories/${id}/activities/`);
  }

  getLabExperiments(id: string): Observable<any> {
    return this.http.get<Experiment[]>(`${config.api.baseUrl}ucl/laboratories/${id}/experiments/`);
  }

  getExperimentByOptions(id_array: any, labId:string): Observable<any> {
    let params = new HttpParams();
    params = params.append('laboratory', labId)
    id_array.forEach((id:string) => {
      params = params.append('id', id);
      
    });

    return this.http.get<Experiment>(`${config.api.baseUrl}ucl/experiments/filter/`, { params });
  }


  addLab(lab: Laboratory): Observable<any> {
    const formData = new FormData();
    formData.append('id', lab.id!)
    formData.append('name', lab.name!);
    formData.append('description', lab.description!);
    formData.append('category', lab.category!);
    formData.append('institution', lab.institution!);
    formData.append('instructor', String(lab.instructor));
    if (lab.image) formData.append('image', lab.image);
    if (lab.youtube_video){
      formData.append('youtube_video', lab.youtube_video);
    }else  if (lab.video) formData.append('video', lab.video);
    return this.http.post<Laboratory>(`${config.api.baseUrl}ucl/laboratories/`, formData);
  }

  addLabGuide(guide: Guide): Observable<any> {
    const formData = new FormData();
    formData.append('title', guide.title!)
    formData.append('url', guide.url!);
    formData.append('laboratory', guide.laboratory)
    return this.http.post<Guide>(`${config.api.baseUrl}ucl/guides/`, formData);
  }

  addLabParameter(parameter: any): Observable<any> {
    const formData = new FormData();
    formData.append('name', parameter.name!);
    if (parameter.unit)  formData.append('unit', parameter.unit!);
    formData.append('laboratory', parameter.laboratory!);

    // Loop through each option in parameter_options
    parameter.parameter_options!.forEach((option: any, index: number) => {
      formData.append(`parameter_options[${index}][id]`, option.id);
      formData.append(`parameter_options[${index}][value]`, option.value);
      if (parameter.unit)   formData.append(`parameter_options[${index}][unit]`, parameter.unit!); 
      
      // Check if there's an image file and append it
      if (option.image) {
        formData.append(`parameter_options[${index}][image]`, option.image); // Ensure this is the actual file object
      }
    });
    return this.http.post<Parameter>(`${config.api.baseUrl}ucl/parameters/`, formData);
  }

  addLabExperiment(experiment: any): Observable<any> {
    const formData = new FormData();
    formData.append('id', experiment.id!);
    formData.append('name', experiment.name!);
    formData.append('laboratory', experiment.laboratory!);

    if (experiment.data_file) formData.append('data_file', experiment.data_file!);
  
    experiment.parameter_options!.forEach( (optionId : string, index:number) => {
      formData.append(`parameter_options[${index}]`, optionId);
    });

    experiment.experiment_media!.forEach((video: any, index: number) => {
      formData.append(`experiment_media[${index}][name]`, video.name);
      if (video.youtube_video) {
        formData.append(`experiment_media[${index}][youtube_video]`, video.youtube_video); 
      }
      else if (video.video) {
        formData.append(`experiment_media[${index}][video]`, video.file); 
      }
    });
    return this.http.post<Experiment>(`${config.api.baseUrl}ucl/experiments/`, formData);
  }

  addExperimentActivities(activity: any): Observable<any> {
    const formData = new FormData();
    formData.append('statement', activity.statement!);
    if(activity.expected_result){
      formData.append('expected_result', activity.expected_result!);
    }

    if(activity.result_unit){
      formData.append('result_unit', activity.result_unit!);
    }
    
    if(activity.laboratory) formData.append('laboratory', activity.laboratory!);
    

    if(activity.experiment) formData.append('experiment', activity.experiment!);

    if(activity.procedures.length > 0) {
      activity.procedures.forEach((procedure: any, index: number) => {
        formData.append(`procedures[${index}][name]`, 'nombre');
        formData.append(`procedures[${index}][data_type]`, procedure.data_type);
        formData.append(`procedures[${index}][data_headers]`, JSON.stringify(procedure.data_headers));
        formData.append(`procedures[${index}][data]`, JSON.stringify(procedure.data));
      });
    }


    return this.http.post<Activity>(`${config.api.baseUrl}ucl/activities/`, formData);
  }

  addActivities(activity: any): Observable<any> {
    const formData = new FormData();
    formData.append('statement', activity.statement!);

    if(activity.expected_result){
      formData.append('expected_result', activity.expected_result!);
    }

    if(activity.result_unit){
      formData.append('result_unit', activity.result_unit!);
    }
    
    if(activity.laboratory) formData.append('laboratory', activity.laboratory!);
    

    if(activity.experiment) formData.append('experiment', activity.experiment!);

    if(activity.procedures.length > 0) {
      activity.procedures.forEach((procedure: any, index: number) => {
        formData.append(`procedures[${index}][name]`, 'nombre');
        formData.append(`procedures[${index}][data_type]`, procedure.data_type);
        formData.append(`procedures[${index}][data_headers]`, JSON.stringify(procedure.data_headers));
        formData.append(`procedures[${index}][data]`, JSON.stringify(procedure.data));
      });
    }


    return this.http.post<Activity>(`${config.api.baseUrl}ucl/activities/`, formData);
  }
}  
