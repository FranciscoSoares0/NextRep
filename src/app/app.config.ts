import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
// Import Firebase functions and types
import {getAuth,provideAuth} from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { firebaseConfig } from '../environments/environment';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';


export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(),
    provideAuth(()=> getAuth()),
    provideFirebaseApp(() => initializeApp(firebaseConfig.firebase)),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideToastr(),
    provideAnimations(), provideAnimationsAsync(),
    provideHttpClient()
  ]
};
