import { Injectable, inject } from '@angular/core';
import { Observable, from, map, catchError, switchMap } from 'rxjs';
import {
  Firestore,
  addDoc,
  collection,
  doc,
  query,
  getDocs,
  deleteDoc,
  where,
  updateDoc,
  onSnapshot,
  collectionData,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

import { Storage } from '@angular/fire/storage';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { IEvent } from '../interfaces/event';
import { Timestamp } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  firebaseAuth = inject(Auth);
  firestore = inject(Firestore);
  toastr = inject(ToastrService);
  usersCollection = collection(this.firestore, 'users');
  storage = inject(Storage);
  router = inject(Router);

  constructor() {}

  getEvents(userUID: string): Observable<IEvent[]> {
    const updatesCollectionRef = collection(
      this.firestore,
      `users/${userUID}/events`
    );

    return collectionData(updatesCollectionRef, { idField: 'id' }).pipe(
      map((updates) => updates as IEvent[]) // cast to IUpdate[] and return
    );
  }

  getTodaysEvents(userUID: string): Observable<IEvent[]> {
    const updatesCollectionRef = collection(
      this.firestore,
      `users/${userUID}/events`
    );
  
    return collectionData(updatesCollectionRef, { idField: 'id' }).pipe(
      map((events) => {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).getTime();
  
        // Filter events that occur today
        return (events as IEvent[]).filter((event) => {
          const eventDate = new Date(event.start.seconds * 1000).getTime(); // Assuming 'start' is a Firestore Timestamp
          return eventDate >= startOfDay && eventDate < endOfDay;
        });
      })
    );
  }

  addEvent(userUID: string, eventData: any): Observable<string> {
    // Specify document path with user UID as the document ID
    const eventsCollectionRef = collection(
      this.firestore,
      `users/${userUID}/events`
    );

    const promise = addDoc(eventsCollectionRef, eventData).then(
      (response) => response.id
    );
    // Use from() to convert setDoc promise into an Observable<void>
    return from(promise);
  }

  updateEvent(
    userUID: string,
    eventID: string,
    eventData: any
  ): Observable<void> {
    const eventDocRef = doc(
      this.firestore,
      `users/${userUID}/events/${eventID}`
    );
    const promise = updateDoc(eventDocRef, eventData)
      .then((response) => {
        this.toastr.success('Workout session edited successfully');
      })
      .catch((err) => {
        this.toastr.error('Error editing workout session: ' + err.message);
        throw err;
      });
    return from(promise);
  }

  deleteEvent(userUID: string, eventID: string): Observable<void> {
    const deleteDocRef = doc(
      this.firestore,
      `users/${userUID}/events/${eventID}`
    );
    const promise = deleteDoc(deleteDocRef)
      .then(() => {
        this.toastr.warning('Workout session deleted successfully');
      })
      .catch((err) => {
        this.toastr.error('Error deleting workout session: ' + err.message);
      });
    return from(promise);
  }

  deleteEventsByWorkout(userUID: string, workoutID: string): Observable<void> {
    const eventsCollectionRef = collection(
      this.firestore,
      `users/${userUID}/events`
    );
    const q = query(eventsCollectionRef, where('workoutid', '==', workoutID));

    return from(getDocs(q)).pipe(
      switchMap((snapshot) => {
        const deletePromises = snapshot.docs.map((doc) => {
          // For each event in the workout's events subcollection, delete it
          return deleteDoc(doc.ref);
        });
        return from(Promise.all(deletePromises)); // Wait for all deletions to complete
      }),
      map(() => {
        this.toastr.success(
          'All workout sessions associated with this workout were successfully deleted'
        );
      }),
      catchError((err) => {
        this.toastr.error('Error deleting workout: ' + err.message);
        throw err;
      })
    );
  }
}
