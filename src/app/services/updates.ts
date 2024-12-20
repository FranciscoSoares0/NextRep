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
  orderBy,
  limit,
  where
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

import {
  Storage
} from '@angular/fire/storage';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { IUpdate } from '../interfaces/update';
import { Timestamp } from '@angular/fire/firestore';
import { updateDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  firebaseAuth = inject(Auth);
  firestore = inject(Firestore);
  toastr = inject(ToastrService);
  usersCollection = collection(this.firestore, 'users');
  storage = inject(Storage);
  router = inject(Router);

  constructor() {}

  // Real-time listener using Angular Fire's collectionData
  getUserUpdates(userUID: string): Observable<IUpdate[]> {
    const updatesCollectionRef = collection(this.firestore, `users/${userUID}/updates`);

    // Order the updates by the 'data' field (Firestore Timestamp)
    const updatesQuery = query(updatesCollectionRef, orderBy('created', 'desc')); // 'desc' for descending order, or 'asc' for ascending

    return collectionData(updatesQuery, { idField: 'id' }).pipe(
      map((updates) => updates as IUpdate[]) // cast to IUpdate[] and return
    );
  }

  getUserUpdatesLastXDays(userUID: string,days:string): Observable<IUpdate[]> {
    const updatesCollectionRef = collection(this.firestore, `users/${userUID}/updates`);
  
    // Get the timestamp for 7 days ago
    const sevenDaysAgo = Timestamp.fromDate(new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000)); // 7 days in milliseconds
  
    // Query to get updates from the last 7 days, ordered by the 'data' field
    const updatesQuery = query(
      updatesCollectionRef,
      where('created', '>=', sevenDaysAgo), // Only include updates where 'data' is within the last 7 days
      orderBy('created', 'asc') // Order updates by the 'data' field in ascending order
    );
  
    return collectionData(updatesQuery, { idField: 'id' }).pipe(
      map((updates) => updates as IUpdate[]) // cast to IUpdate[] and return
    );
  }

  getLatestUserUpdate(userUID: string): Observable<IUpdate> {
    const updatesCollectionRef = collection(this.firestore, `users/${userUID}/updates`);

    // Order by 'data' in descending order and limit to one document
    const latestUpdateQuery = query(updatesCollectionRef, orderBy('created', 'desc'), limit(1));

    return collectionData<IUpdate>(latestUpdateQuery, { idField: 'id' }).pipe(
      map((updates) => (updates as IUpdate[])[0]) // Cast 'updates' to IUpdate[] and get the first element, or undefined if empty
    );
  }

  addUpdate(userUID:string,updateData: any): Observable<void> {
    // Specify document path with user UID as the document ID
    const updatesCollectionRef  = collection(this.firestore, `users/${userUID}/updates`);

    // Use from() to convert setDoc promise into an Observable<void>
    return from(addDoc(updatesCollectionRef , updateData)).pipe(map(() => {}));
  }

  // Update an existing update
  updateUpdate(userUID: string, updateID: string, updatedData: any): Observable<void> {
    const updateDocRef = doc(this.firestore, `users/${userUID}/updates/${updateID}`);
    const promise = updateDoc(updateDocRef, updatedData).then((response) => {
      this.toastr.success('Update successfuly edited');
    }).catch((err) => {
      this.toastr.error('Error on editing update: ' + err.message);  
      throw err;
    });
    return from(promise);
  }

  // Delete an update
  deleteUpdate(userUID: string, updateID: string): Observable<void> {
    const deleteDocRef = doc(this.firestore, `users/${userUID}/updates/${updateID}`);
    const promise = deleteDoc(deleteDocRef).then(( ) => {
      this.toastr.warning('Update successfully deleted');
    }).catch((err) =>{
      this.toastr.error('Error on deleting update: ' + err.message);
    });
    return from(promise);
  }
}
