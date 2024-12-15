import { CommonModule } from '@angular/common';
import { Component,Input, inject } from '@angular/core';

@Component({
  selector: 'app-profile-logo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-logo.component.html',
  styleUrl: './profile-logo.component.css'
})
export class ProfileLogoComponent {

  @Input() nome : string = '';
  @Input() apelido : string = '';
  @Input() cor : string = '';

}
