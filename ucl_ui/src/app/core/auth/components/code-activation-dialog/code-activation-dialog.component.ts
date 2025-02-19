import { Component, ElementRef, Inject, QueryList, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-code-activation-dialog',
  templateUrl: './code-activation-dialog.component.html',
  styleUrls: ['./code-activation-dialog.component.css']
})
export class CodeActivationDialogComponent {
  userId: string;
  password:string;
  email:string;
  @ViewChild('verificationForm') form!: ElementRef<HTMLFormElement>;

  constructor(
    private router: Router,
    private dialogRef: MatDialogRef<CodeActivationDialogComponent>,
    private authService: AuthService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: { userId: string, email: string, password: string }
  ) {
    this.userId = data.userId;
    this.password = data.password;
    this.email = data.email;
  }

  sendCode(): void {
    let valueCode = '';
    
    const inputs = this.form.nativeElement.querySelectorAll('input');

    inputs.forEach(input => {
      valueCode += input.value;
    });

    if (this.userId) {
      var params = {
        id: this.userId,
        verification_code: valueCode,
      };

      this.authService.activateAccount(params).subscribe({
        next: () => {
          this.toastr.success('Your account has been successfully activated.');
          localStorage.removeItem('user_id');
          const user: User = {
                  email: this.email,
                  password: this.password,
                };

          this.authService.login(user).subscribe((response) => {
            if (response != undefined) {
              localStorage.setItem('token', response.body.token);
              this.dialogRef.close(true)
            }
          });
         
        },
        error: () => {
          this.toastr.error('The verification code is invalid.');
        },
      });
    } else {
      this.toastr.error('Verification code format is incorrect.');
    }
  }

  resendCode(): void {
    this.authService.requestVerificationCode(this.userId).subscribe({
      next: () => {
        this.toastr.success('Please check your email for a new verification code.');
      },
      error: () => {
        this.toastr.error('Unable to resend the verification code.');
      },
    });
  }

  handleKeyDown(e: any): void {
    const KEYBOARDS = {
      backspace: 8, arrowLeft: 37,
      arrowRight: 39,
    };

    switch (e.keyCode) {
      case KEYBOARDS.backspace:
        this.handleBackspace(e);
        break;
      case KEYBOARDS.arrowLeft:
        this.handleArrowLeft(e); break;
      case KEYBOARDS.arrowRight:
        this.handleArrowRight(e);
        break;
      default:
    }
  }

  handleInput(e: any): void {
    const input = e.target;
    const nextInput = input.nextElementSibling;
    if (nextInput && input.value) {
      nextInput.focus();
      if (nextInput.value) {
        nextInput.select();
      }
    }
  }

  handlePaste(e: ClipboardEvent): void {
    var inputs = document.querySelectorAll('input');
    e.preventDefault();
    const paste = e.clipboardData!.getData('text');
    inputs.forEach((input, i) => {
      input.value = paste[i] || '';
    });
  }

  handleBackspace(e: any): void {
    const input = e.target;
    if (input.value) {
      input.value = '';
      return;
    }
    if (input.previousElementSibling) {
      input.previousElementSibling.focus();
    }
  }

  handleArrowLeft(e: any): void {
    const previousInput = e.target.previousElementSibling;
    if (!previousInput) return;
    previousInput.focus();
  }

  handleArrowRight(e: any): void {
    const nextInput = e.target.nextElementSibling; if (!nextInput) return;
    nextInput.focus();
  }

}
function ViewChildren(arg0: string): (target: CodeActivationDialogComponent, propertyKey: "inputs") => void {
  throw new Error('Function not implemented.');
}

