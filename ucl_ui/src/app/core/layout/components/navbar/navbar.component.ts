import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { UserService } from 'src/app/core/auth/services/user.service';
import { Group } from 'src/app/core/auth/enums/group';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { User } from '../../../auth/interfaces/user';

import { MatDialog } from '@angular/material/dialog';
import { LaboratoriesDialogComponent } from 'src/app/laboratory/components/laboratories-dialog/laboratories-dialog.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  isHandset: Observable<BreakpointState> = this.breakPointObserver.observe(
    '(max-width: 940px)'
  );

  shownMenu = false;
  showLabsButton = false;
  user: User = {name : "", last_name:"", email:''};

  constructor(
    private router: Router,
    private breakPointObserver: BreakpointObserver,
    private userService: UserService,
    private dialogRef: MatDialog,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer){
    this.matIconRegistry.addSvgIcon(
     "experiment",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/experiment.svg")
    );

    this.matIconRegistry.addSvgIcon(
      "laboratories",
       this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/laboratories.svg")
     );

     this.matIconRegistry.addSvgIcon(
      "account",
       this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/account.svg")
     );

     this.matIconRegistry.addSvgIcon(
      "add",
       this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/add.svg")
     );

     this.matIconRegistry.addSvgIcon(
      "arrowdown",
       this.domSanitizer.bypassSecurityTrustResourceUrl("../../../../assets/arrowdown.svg")
     );
  }

  ngOnInit(): void {
    this.getUserData()
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

  getUserData() {
    this.userService.getUserData().subscribe((response) => {
      this.user=response
    });
  }

  goToHome(): void {
    this.router.navigateByUrl('/');
  }

  goToMyProfile(): void {
    this.router.navigateByUrl('/profile');
  }

  goToLogin(): void {
    this.router.navigateByUrl('/access');
  }

  goToCreateLab(){
    this.router.navigateByUrl('/create-lab');
  }

  openLaboratories(){
    const dialogRef = this.dialogRef.open(LaboratoriesDialogComponent, {
      width: '75vw'
     })
     dialogRef.afterClosed().subscribe((res: any) => {
     })
  }

  logout(): void {
    localStorage.removeItem('token');
    this.goToHome();
    this.shownMenu = false;
    this.showLabsButton = false;
  }
}
