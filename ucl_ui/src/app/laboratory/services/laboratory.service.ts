import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, lastValueFrom, of} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Laboratory } from '../interfaces/laboratory';
import config from '../../config.json';
import { ToastrService } from 'ngx-toastr';
import { Guide } from '../interfaces/guide';
import { Parameter } from '../interfaces/parameter';

@Injectable({
    providedIn: 'root',
})


export class LaboratoryService {
    private URL: string = '';
    private httpOptions = <any>{};
    constructor(private http: HttpClient, private toastr: ToastrService) {  
        this.httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        observe: 'response' as 'response',
      };
      this.URL = `${config.api.baseUrl}ucl/laboratories/`
    }

    getLabs(): Observable<any> {
        return this.http.get<Laboratory[]>(this.URL);
    }

    addLab(lab : Laboratory) : Observable<any>{
      const formData = new FormData();
      formData.append('id', lab.id!)
      formData.append('name', lab.name!);
      formData.append('description', lab.description!);
      formData.append('category', lab.category!);
      formData.append('institution', lab.institution!);
      formData.append('instructor', String(lab.instructor));
      if (lab.image) formData.append('image', lab.image);
      if (lab.video) formData.append('video', lab.video);
      return this.http.post<Laboratory>(this.URL, formData);
    }

    addLabGuide(guide : Guide) : Observable<any>{
      const formData = new FormData();
      formData.append('title', guide.title!)
      formData.append('url', guide.url!);
      formData.append('laboratory', guide.laboratory)
      return this.http.post<Guide>(`${config.api.baseUrl}ucl/guides/`, formData);
    }

    addLabParameter(parameter : any) : Observable<any>{
      const formData = new FormData();
      formData.append('name', parameter.name!)
      formData.append('unit', parameter.unit!);
      formData.append('laboratory', parameter.laboratory!)
      formData.append('parameter_options', parameter.parameter_options!)

      console.log(parameter)
      return this.http.post<Guide>(`${config.api.baseUrl}ucl/parameters/`, formData);
    }

}  
