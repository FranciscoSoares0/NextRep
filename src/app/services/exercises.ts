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

@Injectable({
  providedIn: 'root',
})
export class ExercisesService {
  firebaseAuth = inject(Auth);
  firestore = inject(Firestore);
  toastr = inject(ToastrService);
  usersCollection = collection(this.firestore, 'users');
  storage = inject(Storage);
  router = inject(Router);

  constructor() {}

  // Real-time listener using Angular Fire's collectionData
  getUserExercisesByWorkout(userUID: string, workoutID:string): Observable<IExercise[]> {
    const exercisesCollectionRef = collection(this.firestore, `users/${userUID}/workouts/${workoutID}/exercises`);
    // Query updates where 'data' is within the range of the target date
    const updatesQuery = query(
        exercisesCollectionRef,
        orderBy('created', 'asc')
    );

    return collectionData(updatesQuery, { idField: 'id' }).pipe(
      map((updates) => updates as IExercise[]) // cast to IUpdate[] and return
    );
  }

  getExerciseByID(userUID: string, workoutID: string, exerciseID:string): Observable<IExercise | null> {
    // Get the document reference for the specific workout
    const workoutDocRef = doc(this.firestore, `users/${userUID}/workouts/${workoutID}/exercises/${exerciseID}`);
    
    // Fetch the document using getDoc
    return from(getDoc(workoutDocRef)).pipe(
      map((docSnapshot) => {
        // Check if the document exists
        if (docSnapshot.exists()) {
          return { id: docSnapshot.id, ...docSnapshot.data() } as IExercise;
        } else {
          return null; // Return null if the document does not exist
        }
      })
    );
  }

  addExercise(userUID:string,workoutID:string,exerciseData: any): Observable<void> {
    // Specify document path with user UID as the document ID
    const exercisesCollectionRef  = collection(this.firestore, `users/${userUID}/workouts/${workoutID}/exercises`);

    // Use from() to convert setDoc promise into an Observable<void>
    return from(addDoc(exercisesCollectionRef , exerciseData)).pipe(map(() => {}));
  }

  updateExercise(userUID: string,workoutID:string, exerciseID: string, exerciseData: any): Observable<void> {
    const exerciseCollectionRef = doc(this.firestore, `users/${userUID}/workouts/${workoutID}/exercises/${exerciseID}`);
    const promise = updateDoc(exerciseCollectionRef, exerciseData).then((response) => {
      this.toastr.success('Exercise edited successfully');
    }).catch((err) => {
      this.toastr.error('Error on editing exercise: ' + err.message);  
      throw err;
    });
    return from(promise);
  }

  // Delete an meal
  deleteExercise(userUID: string, workoutID:string, exerciseID: string): Observable<void> {
    const deleteDocRef = doc(this.firestore, `users/${userUID}/workouts/${workoutID}/exercises/${exerciseID}`);
    const promise = deleteDoc(deleteDocRef).then(( ) => {
      this.toastr.warning('Exercise deleted successfully');
    }).catch((err) =>{
      this.toastr.error('Error on deleting exercise: ' + err.message);
    });
    return from(promise);
  }

}
