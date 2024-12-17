import { Component, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHome, faArrowRightFromBracket, faUtensils, faDumbbell, faWeightScale, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../services/auth';
import { OnInit } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { ProfileLogoComponent } from '../profile-logo/profile-logo.component';
import { UserService } from '../../services/user';
import { OnDestroy } from '@angular/core';
import { Subject,takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [FontAwesomeModule,RouterLink,RouterModule, ProfileLogoComponent,CommonModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent implements OnInit,OnDestroy {

  faHome = faHome;
  faArrowRightFromBracket = faArrowRightFromBracket;
  faUtensils = faUtensils;
  faDumbbell  = faDumbbell;
  faWeightScale = faWeightScale;
  faUserShield = faUserShield;

  authService = inject(AuthService);
  userService = inject(UserService);

  nome:string='';
  apelido:string='';
  cor:string='';
  imagePath:string='';

  $unsubscribe: Subject<void> = new Subject<void>();

  ngOnInit(): void {
    this.authService.user$.pipe(takeUntil(this.$unsubscribe)).subscribe((user) => {
      if(user){
        if(user.photoURL)
          this.imagePath = user.photoURL;
        this.userService.getUserById(user.uid).pipe(takeUntil(this.$unsubscribe)).subscribe((userData)=>{
          this.nome = userData!.nome;
          this.apelido = userData!.apelido;
          this.cor = userData!.cor;
        })
      }
        
    });
  }

  ngOnDestroy(): void {
    this.$unsubscribe.next();
    this.$unsubscribe.complete();
  }

  logout(){
    this.authService.logout();
  }


}
