import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, lastValueFrom, of} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Laboratory } from '../interfaces/laboratory';
import config from '../../config.json';
import { ToastrService } from 'ngx-toastr';

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

}  
