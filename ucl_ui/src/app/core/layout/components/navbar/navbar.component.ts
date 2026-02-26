/*
Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
MIT License - See LICENSE file in the root directory
Andres Gamboa, Boris Pedraza, Alex Villazon, Omar Ormachea
*/

import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { UserService } from 'src/app/core/auth/services/user.service';
import { Group } from 'src/app/core/auth/enums/group';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { User } from '../../../auth/interfaces/user';

import { MatDialog } from '@angular/material/dialog';
import { LaboratoriesDialogComponent } from 'src/app/laboratory/components/laboratories-dialog/laboratories-dialog.component';
import { SessionsListDialogComponent } from 'src/app/laboratory/components/sessions-list-dialog/sessions-list-dialog.component';
import { ProfileFormComponent } from 'src/app/core/auth/components/profile-form/profile-form.component';
import { RegistrationComponent } from 'src/app/core/auth/components/registration/registration.component';
import { LoginComponent } from 'src/app/core/auth/components/login/login.component';

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
  user: User = { name: "", last_name: "", email: '' };

  constructor(
    private router: Router,
    private breakPointObserver: BreakpointObserver,
    public userService: UserService,
    private dialogRef: MatDialog,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef // ✅ Inyectamos ChangeDetectorRef
  ) {
    this.matIconRegistry.addSvgIcon(
      "experiment",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/experiment.svg")
    );

    this.matIconRegistry.addSvgIcon(
      "laboratories",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/laboratories.svg")
    );

    this.matIconRegistry.addSvgIcon(
      "account",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/account.svg")
    );

    this.matIconRegistry.addSvgIcon(
      "add",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/add.svg")
    );

    this.matIconRegistry.addSvgIcon(
      "arrowdown",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/arrowdown.svg")
    );
  }

ngOnInit(): void {
  const token = localStorage.getItem('token');
  if (token) {
    this.userService.getUserData().subscribe(); // solo para actualizar el BehaviorSubject al inicio
  }

  this.userService.currentUser$.subscribe(user => {
    this.user = user ?? { name: "", last_name: "", email: '' };
    this.showLabsButton = user?.groups?.some(g => g.name === Group.Instructors) ?? false;
    this.shownMenu = !!user;
    this.cdRef.detectChanges();
  });
}
  getUserData() {
    this.userService.getUserData().subscribe((response) => {
      this.user = response;
      this.cdRef.detectChanges(); 
    });
  }

  goToHome(): void {
    this.router.navigateByUrl('/');
  }

  goToCreateLab() {
    this.router.navigateByUrl('/create-lab');
  }

  openLaboratories() {
    const dialogRef = this.dialogRef.open(LaboratoriesDialogComponent, {
      width: '75vw'
    });
    dialogRef.afterClosed().subscribe();
  }

  openSessions() {
    const dialogRef = this.dialogRef.open(SessionsListDialogComponent, {
      width: '75vw'
    });
    dialogRef.afterClosed().subscribe();
  }

  openProfile() {
    const dialogRef = this.dialogRef.open(ProfileFormComponent, {
      width: '40vw'
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) { 
        this.getUserData(); 
        this.shownMenu = true;
        this.cdRef.detectChanges(); 
      }
    });
  }

  openLogin() {
    const dialogWidth = window.innerWidth < 1000 ? '75vw' : '35vw'; 
    const dialogRef = this.dialogRef.open(LoginComponent, {
      width: dialogWidth
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) { 
        this.getUserData(); 
        this.shownMenu = true;
        this.cdRef.detectChanges(); 
      }
    });
  }

  openSignUp() {
    const dialogWidth = window.innerWidth < 1000 ? '75vw' : '35vw'; 
    const dialogRef = this.dialogRef.open(RegistrationComponent, {
      width: dialogWidth
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) { 
        this.getUserData(); 
        this.shownMenu = true;
        this.cdRef.detectChanges(); 
      }
    });
  }

  logout(): void {
  this.userService.logout();
  this.user = { name: "", last_name: "", email: '' }; // opcional, solo para la variable local
  this.shownMenu = false;
  this.showLabsButton = false;
  this.goToHome();
}
}
