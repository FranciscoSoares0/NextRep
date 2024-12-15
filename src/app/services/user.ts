import { Injectable, inject } from '@angular/core';
import { Observable, from,switchMap } from 'rxjs';
import { IUser } from '../interfaces/user';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  getDoc,
  doc,
  setDoc,
  docData,
  updateDoc,
} from '@angular/fire/firestore';
import { Auth, updateProfile } from '@angular/fire/auth';

import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from '@angular/fire/storage';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  firebaseAuth = inject(Auth);
  firestore = inject(Firestore);
  toastr = inject(ToastrService);
  usersCollection = collection(this.firestore, 'users');
  storage = inject(Storage);
  router = inject(Router);

  constructor() {}

  addUser(userData: IUser): Observable<void> {
    // Specify document path with user UID as the document ID
    const userDocRef = doc(this.firestore, `users/${userData.uid}`);

    // Use from() to convert setDoc promise into an Observable<void>
    return from(setDoc(userDocRef, userData));
  }

  getUserById(id: string): Observable<IUser | undefined> {
    const userDocRef = doc(this.firestore, `users/${id}`);
    return docData(userDocRef, { idField: 'id' }) as Observable<
      IUser | undefined
    >;
  }

  checkUserExists(uid: string): Observable<boolean> {
    const userDocRef = doc(this.firestore, `users/${uid}`);

    return from(getDoc(userDocRef)).pipe(
      switchMap((docSnapshot) => {
        return Promise.resolve(docSnapshot.exists()); // Returns true if user exists
      })
    );
  }

  updateUser(userId: string, userData: any): Observable<void> {
    const docRef = doc(this.firestore, 'users/' + userId);
    const promise = updateDoc(docRef, userData)
      .then((response) => {
        this.toastr.success('Details successfuly edited');
        this.router.navigateByUrl('/home');
      })
      .catch((err) => {
        this.toastr.error('Error on editing details: ' + err.message);
        throw err;
      });
    return from(promise);
  }

  updateConsecutiveDays(userId: string, userData: any): Observable<void> {
    const docRef = doc(this.firestore, 'users/' + userId);
    const promise = updateDoc(docRef, userData)
      .then((response) => {
      })
      .catch((err) => {
        throw err;
      });
    return from(promise);
  }

  uploadImage(selectedImg: File, userData: any, id: string) {
    const filePath = `usersProfileIMG/${Date.now()}`;
    const storageRef = ref(this.storage, filePath);

    const currentUser = this.firebaseAuth.currentUser;
    if(selectedImg != null){
      if (currentUser?.photoURL) {
        const oldImageRef = ref(this.storage, currentUser.photoURL);
        console.log("oldImageRef");
        console.log(oldImageRef);
        deleteObject(oldImageRef)
          .then(() => {
            console.log('Previous profile image deleted');
            // Proceed with uploading the new image
            this.uploadNewImage(storageRef, selectedImg,userData,id);
          })
          .catch((error) => {
            console.error('Error deleting previous image:', error);
            // Still try uploading the new image even if deletion fails
          });
      }
      else{
        this.uploadNewImage(storageRef, selectedImg,userData,id);
      }
    }
    else{
    this.updateUser(id, userData);
    }

  }

  uploadNewImage(storageRef: any, selectedImg: File, userData: any, id: string) {
    return uploadBytes(storageRef, selectedImg)
      .then(() => {
        getDownloadURL(storageRef).then((res) => {
          this.updatePhotoURL(res).subscribe({
            next : () => {
              this.updateUser(id, userData);
            }
          })
        }); 
      })
      .catch((error) => {
        throw error;
      });
  }

  updatePhotoURL(photoURL: string): Observable<void> {
    const promise = updateProfile(this.firebaseAuth.currentUser!, { photoURL });
    return from(promise);
  }
}
