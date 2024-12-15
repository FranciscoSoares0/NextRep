import { Injectable, inject } from '@angular/core';
import { Observable, from,map } from 'rxjs';
import {
  Firestore,
  addDoc,
  collection,
  doc,
  query,
  setDoc ,
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
import { IMeal } from '../interfaces/meal';

@Injectable({
  providedIn: 'root',
})
export class MealsService {
  firebaseAuth = inject(Auth);
  firestore = inject(Firestore);
  toastr = inject(ToastrService);
  usersCollection = collection(this.firestore, 'users');
  storage = inject(Storage);
  router = inject(Router);

  constructor() {}

  // Real-time listener using Angular Fire's collectionData
  getUserMealsByDay(userUID: string, targetDate: Date): Observable<IMeal[]> {
    const updatesCollectionRef = collection(this.firestore, `users/${userUID}/meals`);

    // Convert targetDate to Firestore-compatible Timestamp for filtering
    const startOfDay = Timestamp.fromDate(new Date(targetDate.setHours(0, 0, 0, 0)));
    const endOfDay = Timestamp.fromDate(new Date(targetDate.setHours(23, 59, 59, 999)));

    // Query updates where 'data' is within the range of the target date
    const updatesQuery = query(
        updatesCollectionRef,
        where('created', '>=', startOfDay),
        where('created', '<=', endOfDay),
    );

    return collectionData(updatesQuery, { idField: 'id' }).pipe(
      map((updates) => updates as IMeal[]) // cast to IUpdate[] and return
    );
  }

  addMeal(userUID:string,mealData: any): Observable<void> {
    // Specify document path with user UID as the document ID
    const mealsCollectionRef  = collection(this.firestore, `users/${userUID}/meals`);

    // Use from() to convert setDoc promise into an Observable<void>
    return from(addDoc(mealsCollectionRef , mealData)).pipe(map(() => {}));
  }

  // Update an existing meal
  updateMeal(userUID: string, mealID: string, mealData: any): Observable<void> {
    const mealDocRef = doc(this.firestore, `users/${userUID}/meals/${mealID}`);
    const promise = updateDoc(mealDocRef, mealData).then((response) => {
      this.toastr.success('Food successfully edited');
    }).catch((err) => {
      this.toastr.error('Error on editing food: ' + err.message);  
      throw err;
    });
    return from(promise);
  }

  // Delete an meal
  deleteMeal(userUID: string, mealID: string): Observable<void> {
    const deleteDocRef = doc(this.firestore, `users/${userUID}/meals/${mealID}`);
    const promise = deleteDoc(deleteDocRef).then(( ) => {
      this.toastr.warning('Food successfully deleted');
    }).catch((err) =>{
      this.toastr.error('Error on deleting food: ' + err.message);
    });
    return from(promise);
  }
}
