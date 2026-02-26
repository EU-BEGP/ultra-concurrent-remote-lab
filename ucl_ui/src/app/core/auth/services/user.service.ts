import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

import { User } from '../interfaces/user';
import config from 'src/app/config.json';
import { Router } from '@angular/router';

/*
Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
MIT License - See LICENSE file in the root directory
Andres Gamboa, Boris Pedraza, Alex Villazon, Omar Ormachea
*/

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private httpOptions = <any>{};

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private httpClient: HttpClient,  private router: Router) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      observe: 'response' as 'response',
    };
  }

  getUserData(): Observable<User> {
    const URL: string = `${config.api.baseUrl}${config.api.users.me}`;
    return this.httpClient.get<User>(URL).pipe(
      tap(user => this.currentUserSubject.next(user)) 
    );
  }

  updateUserData(user: User): Observable<any> {
    const URL: string = `${config.api.baseUrl}${config.api.users.me}`;
    return this.httpClient.patch(URL, user, this.httpOptions).pipe(
      tap(() => this.currentUserSubject.next(user)) 
    );
  }
  logout() {
     localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }

}
