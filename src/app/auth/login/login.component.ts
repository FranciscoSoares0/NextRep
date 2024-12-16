import { Component, inject } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { faGoogle,faFacebook } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, FontAwesomeModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);
  toastr = inject(ToastrService);

  faGoogle = faGoogle;
  faFacebook = faFacebook;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  errorMessage: string | null = null;

  get fc() {
    return this.loginForm.controls;
  }

  onSubmit() {
    const rawForm = this.loginForm.getRawValue();
    this.authService.login(rawForm.email, rawForm.password).subscribe({
      complete: () => {
        this.router.navigateByUrl('/home');
      },
      error: (err) => {
        let errorMessage = '';

        switch (err.code) {
          case 'auth/user-not-found':
            errorMessage = 'No user found with this email.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password. Please try again.';
            break;
          case 'auth/network-request-failed':
            errorMessage =
              'Network error. Please check your internet connection.';
            break;
          case 'auth/invalid-credential':  // Handling invalid-credential error
            errorMessage = 'Credenciais inválidas. Por favor confira o seu email e password.';
            break;
          default:
            errorMessage = 'An unknown error occurred. Please try again later.';
        }
        this.toastr.error(errorMessage);
      },
    });
  }

  continueWithGoogle() {
    this.authService.loginWithGoogle().subscribe({
      complete: () => {
        this.router.navigateByUrl('/home');
      },
      error: (err) => {
        this.toastr.error(err);
      }
    });
  }
  
  continueWithFacebook() {
    this.authService.loginWithFacebook().subscribe({
      complete: () => {
        this.router.navigateByUrl('/home');
      },
      error: (err) => {
        this.toastr.error(err);
      }
    });
  }
  
}
