import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  user,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
} from '@angular/fire/auth';
import { Observable, from, BehaviorSubject, switchMap } from 'rxjs';
import { IUser } from '../interfaces/user';
import { Router } from '@angular/router';
import { UserService } from './user';
import { UpdateService } from './updates';
import { Timestamp } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  router = inject(Router);
  user$: Observable<IUser | null>;

  userService = inject(UserService);
  updatesService = inject(UpdateService);

  constructor(private firebaseAuth: Auth) {
    this.user$ = user(this.firebaseAuth) as Observable<IUser | null>;
  }

  register(userData: any, updateData: any, password: string): Observable<void> {
    // Create the user with email and password
    return from(
      createUserWithEmailAndPassword(
        this.firebaseAuth,
        userData.email,
        password
      )
    ).pipe(
      // Use switchMap to chain the Firebase user creation to adding user data to Firestore
      switchMap((ref: UserCredential) => {
        // Prepare user data object
        userData['uid'] = ref.user.uid;

        this.updatesService
          .addUpdate(ref.user.uid, updateData)
          .subscribe(() => {});

        // Call addUser in userService and return its observable
        return this.userService.addUser(userData);
      })
    );
  }

  // Google Registration
  registerWithGoogle(userData: any, updateData: any): Observable<void> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.firebaseAuth, provider)).pipe(
      switchMap((ref: UserCredential) => {
        userData['uid'] = ref.user.uid;
        userData['email'] = ref.user.email;
        this.updatesService
          .addUpdate(ref.user.uid, updateData)
          .subscribe(() => {});
        return this.userService.addUser(userData); // Save user to your userService
      })
    );
  }

  // Facebook Registration
  registerWithFacebook(userData: any, updateData: any): Observable<void> {
    const provider = new FacebookAuthProvider();
    return from(signInWithPopup(this.firebaseAuth, provider)).pipe(
      switchMap((ref: UserCredential) => {
        userData['uid'] = ref.user.uid;
        userData['email'] = ref.user.email;
        this.updatesService
          .addUpdate(ref.user.uid, updateData)
          .subscribe(() => {});
        return this.userService.addUser(userData); // Save user to your userService
      })
    );
  }

  getRandomHexColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(
      this.firebaseAuth,
      email.trim(),
      password.trim()
    ).then(() => {});
    return from(promise);
  }

  // Login with Google
  loginWithGoogle(): Observable<void> {
    const provider = new GoogleAuthProvider();

    return from(signInWithPopup(this.firebaseAuth, provider)).pipe(
      switchMap((ref: UserCredential) => {
        // Check if the user exists in Firestore
        const uid = ref.user.uid;

        return this.userService.checkUserExists(uid).pipe(
          switchMap((exists: boolean) => {
            if (exists) {
              // User exists; continue login
              return from(Promise.resolve());
            } else {
              // User does not exist; sign out and throw an error
              return from(signOut(this.firebaseAuth)).pipe(
                switchMap(() => {
                  throw new Error('User not registered.');
                })
              );
            }
          })
        );
      })
    );
  }

  // Login with Facebook
loginWithFacebook(): Observable<void> {
  const provider = new FacebookAuthProvider();

  return from(signInWithPopup(this.firebaseAuth, provider)).pipe(
    switchMap((ref: UserCredential) => {
      const uid = ref.user.uid; // Get the user's UID

      // Check if the user exists in Firestore
      return this.userService.checkUserExists(uid).pipe(
        switchMap((exists: boolean) => {
          if (exists) {
            // User exists, proceed with login
            return from(Promise.resolve());
          } else {
            // User does not exist, sign out and throw an error
            return from(signOut(this.firebaseAuth)).pipe(
              switchMap(() => {
                throw new Error('User not registered.');
              })
            );
          }
        })
      );
    })
  );
}


  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth).then(() => {
      this.router.navigate(['/login']);
    });
    return from(promise);
  }

  resetPassword(email: string): Observable<void> {
    // Call Firebase's sendPasswordResetEmail function
    const promise = sendPasswordResetEmail(this.firebaseAuth, email).then(
      () => {}
    );
    return from(promise);
  }
}
