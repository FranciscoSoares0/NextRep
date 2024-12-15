import { Component, inject, OnDestroy } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { AuthService } from '../../services/auth';
import { OnInit } from '@angular/core';
import { UserService } from '../../services/user';
import { LoadingComponent } from '../loading/loading.component';
import { CommonModule } from '@angular/common';
import { MealsCardComponent } from './meals-card/meals-card.component';
import { UpdatesCardComponent } from './updates-card/updates-card.component';
import { WorkoutsCardComponent } from './workouts-card/workouts-card.component';
import { Timestamp } from 'firebase/firestore';
import { Subject,takeUntil } from 'rxjs';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NavBarComponent,
    LoadingComponent,
    CommonModule,
    MealsCardComponent,
    UpdatesCardComponent,
    WorkoutsCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  userService = inject(UserService);

  loading: boolean = true;

  currentDate: Date = new Date();
  userID : string = '';

  lastLoginDate: Date = new Date();
  consecutiveDays : number = 0;

  pesoInicial : number = 0;
  objetivo : number = 0;

  calorias: number = 0;
  proteinas: number = 0;
  gorduras: number = 0;
  hidratos: number = 0;

  agua: number = 0;

  caloriasCardio: number = 0;

  // Method to receive data from WorkoutCard
  onWorkoutDataReceived(data: number): void {
    this.caloriasCardio = data;
  }

  $unsubscribe: Subject<void> = new Subject<void>();

  ngOnInit(): void {
    this.authService.user$.pipe(takeUntil(this.$unsubscribe)).subscribe((user) => {
      if (user) {
        this.userService.getUserById(user.uid).pipe(takeUntil(this.$unsubscribe)).subscribe((userData) => {
          if (userData) {
            this.userID = userData.uid;
            this.proteinas = userData.proteinas;
            this.gorduras = userData.gorduras;
            this.hidratos = userData.hidratos;
            this.calorias = userData.calorias;
            this.agua = userData.agua;
            this.pesoInicial = userData.peso;
            this.objetivo = userData.objetivo;
            this.lastLoginDate = userData.lastLoginDate.toDate();
            this.consecutiveDays = userData.consecutiveDays;
            this.updateConsecutiveLoginDays();
          }
          this.loading = false;
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.$unsubscribe.next();
    this.$unsubscribe.complete();
  }

  updateConsecutiveLoginDays() {
    const lastLoginDate = new Date(this.lastLoginDate); // Convert Timestamp to JS Date
    const currentDate = new Date(this.currentDate); // Assuming this.currentDate is a Timestamp

    // Strip the time part from the dates to only compare dates
    const lastLoginDay = new Date(lastLoginDate.getFullYear(), lastLoginDate.getMonth(), lastLoginDate.getDate());
    const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    // Calculate the difference in days
    const dayDifference = (currentDay.getTime() - lastLoginDay.getTime()) / (1000 * 60 * 60 * 24);

    let newConsecutiveDays = this.consecutiveDays;

    if (dayDifference === 1) {
        // If the user logged in the next day, increment consecutive days
        newConsecutiveDays += 1;
    } else if (dayDifference > 1) {
        // If the user missed a day, reset consecutive days
        newConsecutiveDays = 1;
    }

    // Update user data only if the current date is different from the last login date
    if (dayDifference >= 1) {
        const userData = {
            lastLoginDate: Timestamp.fromDate(currentDate),
            consecutiveDays: newConsecutiveDays,
        };

        this.userService.updateConsecutiveDays(this.userID, userData)
            .subscribe(() => {});
    }
}

}
