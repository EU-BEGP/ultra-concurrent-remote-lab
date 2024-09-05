import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { map, Observable } from 'rxjs';
import { UserService } from 'src/app/core/auth/services/user.service';
import { Group } from 'src/app/core/auth/enums/group';

@Injectable({
  providedIn: 'root',
})
export class LabsGuard implements CanActivate {
  constructor(private router: Router, private userService: UserService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.checkUserGroup();
  }

  checkUserGroup(): Observable<boolean> {
    return this.userService.getUserData().pipe(
      map((user) => {
        if (
          user &&
          user.groups!.find((group) => group.name === Group.Instructors)
        ) {
          return true;
        } else {
          this.router.navigate(['home']);
          return false;
        }
      })
    );
  }
}
