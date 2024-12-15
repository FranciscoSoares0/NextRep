import { Injectable, inject } from '@angular/core';
import { Observable, from,map } from 'rxjs';
import {
  Firestore,
  addDoc,
  collection,
  doc,
  query,
  getDoc ,
  deleteDoc,
  collectionData,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

import {
  Storage
} from '@angular/fire/storage';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Timestamp } from '@angular/fire/firestore';
import { IExercise } from '../interfaces/exercise';
import { orderBy } from 'firebase/firestore';
import { IWorkout } from '../interfaces/workout';
import { CalendarService } from './calendar';

@Injectable({
  providedIn: 'root',
})
export class WorkoutsService {
  firebaseAuth = inject(Auth);
  firestore = inject(Firestore);
  toastr = inject(ToastrService);
  usersCollection = collection(this.firestore, 'users');
  storage = inject(Storage);
  router = inject(Router);

  constructor() {}

  calendarService = inject(CalendarService);

  getWorkouts(userUID: string): Observable<IWorkout[]> {
    const workoutsCollectionRef = collection(this.firestore, `users/${userUID}/workouts`);
  
    return collectionData(workoutsCollectionRef, { idField: 'id' }).pipe(
      map((workouts) => workouts as IWorkout[]) // 
    );
  }
  getWorkoutByID(userUID: string, workoutID: string): Observable<IWorkout | null> {
    // Get the document reference for the specific workout
    const workoutDocRef = doc(this.firestore, `users/${userUID}/workouts/${workoutID}`);
    
    // Fetch the document using getDoc
    return from(getDoc(workoutDocRef)).pipe(
      map((docSnapshot) => {
        // Check if the document exists
        if (docSnapshot.exists()) {
          return { id: docSnapshot.id, ...docSnapshot.data() } as IWorkout;
        } else {
          return null; // Return null if the document does not exist
        }
      })
    );
  }

  addWorkout(userUID:string,workoutData: any): Observable<void> {
    // Specify document path with user UID as the document ID
    const workoutsCollectionRef  = collection(this.firestore, `users/${userUID}/workouts`);

    // Use from() to convert setDoc promise into an Observable<void>
    return from(addDoc(workoutsCollectionRef , workoutData)).pipe(map(() => {}));
  }

  updateWorkout(userUID: string, workoutID: string, workoutData: any): Observable<void> {
    const workoutDocRef = doc(this.firestore, `users/${userUID}/workouts/${workoutID}`);
    const promise = updateDoc(workoutDocRef, workoutData).then((response) => {
      this.toastr.success('Workout edited successfully');
    }).catch((err) => {
      this.toastr.error('Error on editing workout: ' + err.message);  
      throw err;
    });
    return from(promise);
  }

  deleteWorkout(userUID: string, workoutID: string): Observable<void> {
    const deleteDocRef = doc(this.firestore, `users/${userUID}/workouts/${workoutID}`);
    const promise = deleteDoc(deleteDocRef).then(( ) => {
    }).catch((err) =>{
      this.toastr.error('Error on deleting workout: ' + err.message);
    });
    return from(promise);
  }

}
