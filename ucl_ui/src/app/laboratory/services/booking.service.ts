import config from '../../config.json';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http'; import { Observable, lastValueFrom, of } from 'rxjs';
import { Injectable } from '@angular/core'
import { ToastrService } from 'ngx-toastr';
import { Laboratory } from '../interfaces/laboratory';

@Injectable({
    providedIn: 'root',
  })
  

  export class BookingService {
    private httpOptions = <any>{};
    constructor(private http: HttpClient, private toastr: ToastrService) {
      this.httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        observe: 'response' as 'response',
      };
    }

    urlBooking = "https://eubbc-digital.upb.edu/booking/api/laboratories/"


    addLab(lab: any): Observable<any> {
        const formData = new FormData();
        formData.append('name', lab.name!);
        formData.append('instructor', lab.instructor!);
        formData.append('university', lab.university!);
        formData.append('course', lab.course!);
        if (lab.image) formData.append('image', lab.image);
        formData.append('url', lab.url!);
        formData.append('description', lab.description!);
        formData.append('visible', String(lab.visible!));
        formData.append('notify_owner', String(lab.notify_owner!));
        formData.append('allowed_emails', String(lab.allowed_emails));
        formData.append('enabled', '1');
        formData.append('type', String(lab.type!));

    return this.http.post<Laboratory>(this.urlBooking, formData);
      }
  }  