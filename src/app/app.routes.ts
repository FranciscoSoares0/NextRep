import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { HomeComponent } from './layouts/home/home.component';
import { AuthGuard } from './services/authGuard';
import { NotFoundComponent } from './layouts/not-found/not-found.component';
import { UserDetailsComponent } from './auth/user-details/user-details.component';
import { UpdatesComponent } from './ativities/updates/updates.component';
import { MealsComponent } from './ativities/meals/meals.component';
import { WorkoutComponent } from './ativities/workouts/workout/workout.component';
import { CalendarComponent } from './ativities/workouts/calendar/calendar.component';
import { ExerciseComponent } from './ativities/workouts/exercise/exercise.component';
import { RegisterNewComponent } from './auth/register-new/register-new.component';
import { PrivacyPolicyComponent } from './layouts/privacy-policy/privacy-policy.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' }, // Redirect root to 'home' or another default
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterNewComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'userDetails', component: UserDetailsComponent, canActivate: [AuthGuard] },
    { path: 'calendar', component: CalendarComponent, canActivate: [AuthGuard] },
    { path: 'calendar/workout/:workoutid', component: WorkoutComponent, canActivate: [AuthGuard] },
    { path: 'calendar/workout/:workoutid/exercise/:exerciseid', component: ExerciseComponent, canActivate: [AuthGuard] },
    { path: 'updates', component: UpdatesComponent, canActivate: [AuthGuard] },
    { path: 'meals', component: MealsComponent, canActivate: [AuthGuard] },
    { path: 'privacy-policy', component: PrivacyPolicyComponent, canActivate: [AuthGuard] },
    { path: '**', component: NotFoundComponent } // Wildcard route for 404 page
];