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
import { Session } from '../interfaces/session';
import { SolvedActivity } from '../interfaces/solvedActivity';

@Injectable({
    providedIn: 'root',
  })
  

  export class SessionService {
    private httpOptions = <any>{};
    constructor(private http: HttpClient, private toastr: ToastrService) {
      this.httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        observe: 'response' as 'response',
      };
    }
  
    getSessions(): Observable <any> {
        return this.http.get<Session[]>(`${config.api.baseUrl}ucl/sessions/`);
    }

    getSessionById(id: string): Observable <any> {
        return this.http.get<Session>(`${config.api.baseUrl}ucl/sessions/${id}/`);
    }

    getSolvedActivitiesById(id: string): Observable <any> {
      return this.http.get<Session>(`${config.api.baseUrl}ucl/sessions/${id}/solved-activities`);
  }

    addSession(session: Session): Observable<any> {
        const formData = new FormData();
        formData.append('id', session.id!)
        formData.append('laboratory', session.laboratory!)
        formData.append('user', String(session.user!))
        formData.append('name',session.name!)
        return this.http.post<Session>(`${config.api.baseUrl}ucl/sessions/`, formData);
      }

    addSolvedActivities(solved_activity: any): Observable<any> {
      const test_file = '../store/Test-handsontable.csv'
        const formData = new FormData();
        if(solved_activity.result) formData.append('result', solved_activity.result!)
        formData.append('activity', solved_activity.activity!)
        formData.append('session', solved_activity.session!)
        if(solved_activity.procedures.length > 0) {
          solved_activity.procedures.forEach((procedure: any, index: number) => {
            formData.append(`procedures[${index}][name]`, 'nombre');
            formData.append(`procedures[${index}][data_type]`, procedure.data_type);
            formData.append(`procedures[${index}][data_headers]`, JSON.stringify(procedure.data_headers));
            formData.append(`procedures[${index}][data]`, JSON.stringify(procedure.data));
          });
        }
        return this.http.post<SolvedActivity>(`${config.api.baseUrl}ucl/solved-activities/`, formData);
    }

    deleteSession(id: string): Observable<any> {
      return this.http.delete<Session>(`${config.api.baseUrl}ucl/sessions/${id}/`);
    }
  
  }  