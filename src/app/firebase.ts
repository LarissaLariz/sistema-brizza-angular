import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  app = initializeApp(environment.firebase);

  auth = getAuth(this.app);

  provider = new GoogleAuthProvider();


  async loginComGoogle() {
    const resultado = await signInWithPopup(
      this.auth,
      this.provider
    );

    return resultado.user;
  }

}