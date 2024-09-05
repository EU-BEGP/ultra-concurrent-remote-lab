import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { UserService } from 'src/app/core/auth/services/user.service';
import { Group } from 'src/app/core/auth/enums/group';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  isHandset: Observable<BreakpointState> = this.breakPointObserver.observe(
    Breakpoints.Handset
  );

  shownMenu = false;
  showLabsButton = false;

  constructor(
    private router: Router,
    private breakPointObserver: BreakpointObserver,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
      this.userService.getUserData().subscribe(
        (user) => {
          user.groups!.forEach((group) => {
            if (group.name === Group.Instructors) this.showLabsButton = true;
          });
        },
        (err) => (this.shownMenu = false)
      );

      this.shownMenu = true;
    } else {
      this.shownMenu = false;
      this.showLabsButton = false;
    }
  }

  goToHome(): void {
    this.router.navigateByUrl('/home');
  }

  goToMyProfile(): void {
    this.router.navigateByUrl('/profile');
  }

  goToLogin(): void {
    this.router.navigateByUrl('/access');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.goToHome();
    this.shownMenu = false;
    this.showLabsButton = false;
  }
}
