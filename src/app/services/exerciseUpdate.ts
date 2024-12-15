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
import { IExerciseUpdate } from '../interfaces/exerciseUpdate';

@Injectable({
  providedIn: 'root',
})
export class ExerciseUpdateService {
  firebaseAuth = inject(Auth);
  firestore = inject(Firestore);
  toastr = inject(ToastrService);
  usersCollection = collection(this.firestore, 'users');
  storage = inject(Storage);
  router = inject(Router);

  constructor() {}

  // Real-time listener using Angular Fire's collectionData
  getUserUpdatesByExercise(userUID: string, workoutID:string, exerciseID:string): Observable<IExerciseUpdate[]> {
    const exercisesCollectionRef = collection(this.firestore, `users/${userUID}/workouts/${workoutID}/exercises/${exerciseID}/updates`);
    // Query updates where 'data' is within the range of the target date
    const updatesQuery = query(
        exercisesCollectionRef,
        orderBy('created', 'desc')
    );

    return collectionData(updatesQuery, { idField: 'id' }).pipe(
      map((updates) => updates as IExerciseUpdate[]) // cast to IUpdate[] and return
    );
  }


  addUpdate(userUID:string,workoutID:string,exerciseID:string,exerciseUpdateData: any): Observable<void> {
    // Specify document path with user UID as the document ID
    const exerciseUpdateCollectionRef  = collection(this.firestore, `users/${userUID}/workouts/${workoutID}/exercises/${exerciseID}/updates`);

    // Use from() to convert setDoc promise into an Observable<void>
    return from(addDoc(exerciseUpdateCollectionRef , exerciseUpdateData)).pipe(map(() => {}));
  }

  updateExerciseUpdate(userUID: string,workoutID:string, exerciseID: string, exerciseUpdateID : string, exerciseData: any): Observable<void> {
    const exerciseUpdateCollectionRef = doc(this.firestore, `users/${userUID}/workouts/${workoutID}/exercises/${exerciseID}/updates/${exerciseUpdateID}`);
    const promise = updateDoc(exerciseUpdateCollectionRef, exerciseData).then((response) => {
      this.toastr.success('Update successfully edited');
    }).catch((err) => {
      this.toastr.error('Error on editing update: ' + err.message);  
      throw err;
    });
    return from(promise);
  }

  // Delete an meal
  deleteExerciseUpdate(userUID: string, workoutID:string, exerciseID: string, exerciseUpdateID:string): Observable<void> {
    const deleteDocRef = doc(this.firestore, `users/${userUID}/workouts/${workoutID}/exercises/${exerciseID}/updates/${exerciseUpdateID}`);
    const promise = deleteDoc(deleteDocRef).then(( ) => {
      this.toastr.warning('Update successfully deleted');
    }).catch((err) =>{
      this.toastr.error('Error on deleting update: ' + err.message);
    });
    return from(promise);
  }

}
