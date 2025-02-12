import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ValidatorFn,
  ValidationErrors,
  AbstractControl
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user';
import { MatDialog } from '@angular/material/dialog';
import { CodeActivationDialogComponent } from '../code-activation-dialog/code-activation-dialog.component';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent implements OnInit {
  hidePassword: boolean = true;
  hidePasswordConfirmation: boolean = true;

  registrationForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(8)
    ]],
    passwordConfirmation: ['', [
      Validators.required
    ]],
  }, { validators: this.matchPasswordValidator('password', 'passwordConfirmation') });

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void { }

  /*** HTML interaction functions ***/

  onSubmit(): void {
    if (this.registrationForm.valid) {
      this.registerUser();
    } else {
      this.toastr.error(
        'Please, complete correctly the information.',
        'Invalid action'
      );
    }
  }

  /*** Service interaction functions ***/

  registerUser(): void {
    const registrationFormValue: any = this.registrationForm.value;
    const user: User = {
      name: registrationFormValue.name,
      last_name: registrationFormValue.lastName,
      email: registrationFormValue.email,
      password: registrationFormValue.password
    }

    this.authService.signUp(user).subscribe((response) => {
      if (response.status !== null && response.status === 201) {
        localStorage.setItem('user_id', response.body.id.toString());
        console.log(response)
        this.toastr.success(
          `Welcome ${user.name}`,
          'Successful registration',
        );
        this.openActivationDialog(response.body.id);
      }
    });
  }

  openActivationDialog(userId: string): void {
    this.dialog.open(CodeActivationDialogComponent, {
      width: '40vw',
      disableClose: true, 
      data: { userId }
    });
  }

  /*** Internal functions ***/

  /* Form manipulation */

  // Getters
  get nameControl() {
    return this.registrationForm.get('name');
  }

  get lastNameControl() {
    return this.registrationForm.get('lastName');
  }

  get emailControl() {
    return this.registrationForm.get('email');
  }

  get passwordControl() {
    return this.registrationForm.get('password');
  }

  get passwordConfirmationControl() {
    return this.registrationForm.get('passwordConfirmation');
  }

  /* Custom Validator */
  matchPasswordValidator(passwordKey: string, passwordConfirmationKey: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const passwordControl = formGroup.get(passwordKey);
      const passwordConfirmationControl = formGroup.get(passwordConfirmationKey);

      if (!passwordControl || !passwordConfirmationControl) {
        return null; // Return null if controls are not found
      }

      if (passwordControl.value !== passwordConfirmationControl.value) {
        return { passwordsMismatch: true }; // Return an error object if passwords do not match
      }

      return null; // Return null if passwords match
    };
  }
}