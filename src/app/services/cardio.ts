import { Injectable, inject } from '@angular/core';
import { Observable, from,map } from 'rxjs';
import {
  Firestore,
  addDoc,
  collection,
  doc,
  query,
  deleteDoc,
  collectionData,
  updateDoc,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

import {
  Storage
} from '@angular/fire/storage';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { orderBy } from 'firebase/firestore';
import { ICardio } from '../interfaces/cardio';

@Injectable({
  providedIn: 'root',
})
export class CardiosService {
  firebaseAuth = inject(Auth);
  firestore = inject(Firestore);
  toastr = inject(ToastrService);
  usersCollection = collection(this.firestore, 'users');
  storage = inject(Storage);
  router = inject(Router);

  constructor() {}

  // Real-time listener using Angular Fire's collectionData
  getUserCardioExercisesByWorkout(userUID: string, workoutID:string): Observable<ICardio[]> {
    const cardioExercisesCollectionRef = collection(this.firestore, `users/${userUID}/workouts/${workoutID}/cardio`);
    // Query updates where 'data' is within the range of the target date
    const updatesQuery = query(
        cardioExercisesCollectionRef,
        orderBy('created', 'asc')
    );

    return collectionData(updatesQuery, { idField: 'id' }).pipe(
      map((updates) => updates as ICardio[]) // cast to IUpdate[] and return
    );
  }

  addCardioExercise(userUID:string,workoutID:string,cardioExerciseData: any): Observable<void> {
    // Specify document path with user UID as the document ID
    const cardioExercisesCollectionRef  = collection(this.firestore, `users/${userUID}/workouts/${workoutID}/cardio`);

    // Use from() to convert setDoc promise into an Observable<void>
    return from(addDoc(cardioExercisesCollectionRef , cardioExerciseData)).pipe(map(() => {}));
  }

  updateCardioExercise(userUID: string,workoutID:string, cardioExerciseID: string, cardioExerciseData: any): Observable<void> {
    const exerciseCollectionRef = doc(this.firestore, `users/${userUID}/workouts/${workoutID}/cardio/${cardioExerciseID}`);
    const promise = updateDoc(exerciseCollectionRef, cardioExerciseData).then((response) => {
      this.toastr.success('Cardiovascular exercise edited successfully');
    }).catch((err) => {
      this.toastr.error('Error on updating cardiovascular exercise' + err.message);  
      throw err;
    });
    return from(promise);
  }

  deleteCardioExercise(userUID: string, workoutID:string, cardioExerciseID: string): Observable<void> {
    const deleteDocRef = doc(this.firestore, `users/${userUID}/workouts/${workoutID}/cardio/${cardioExerciseID}`);
    const promise = deleteDoc(deleteDocRef).then(( ) => {
      this.toastr.warning('Cardiovascular exercise removed successfully');
    }).catch((err) =>{
      this.toastr.error('Error on deleting cardiovascular exercise: ' + err.message);
    });
    return from(promise);
  }

}
