import { Component,inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { OnInit } from '@angular/core';
import { AuthService } from './services/auth';
import { LoadingComponent } from './layouts/loading/loading.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,LoadingComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);

  ngOnInit(): void{}
}
