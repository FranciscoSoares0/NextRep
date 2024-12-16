import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent  {
  authService = inject(AuthService);
  toastr = inject(ToastrService);

  email: string = '';


  onSubmit(emailForm:any) {
    this.authService.resetPassword(this.email).subscribe({
      next: () => {
        emailForm.resetForm();
        this.toastr.info("Email sent. Follow the instructions to acess your NextRep account.");
      },
      complete:()=>{

      }
    });
    
  }
}
