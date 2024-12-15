import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';


export const AuthGuard: CanActivateFn = (route, state) => {
  const firebaseAuth = inject(AuthService);
  const router = inject(Router);
  
  return firebaseAuth.user$.pipe(
    map(user => {
      if (user) {
        return true; // Allow access if user is authenticated
      } else {
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } }); // Redirect to login if not authenticated
        return false;
      }
    })
  );
};
