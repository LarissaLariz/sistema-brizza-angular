import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

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

  async cadastrarComEmail(nome: string, email: string, senha: string) {
    const resultado = await createUserWithEmailAndPassword(this.auth, email, senha);

    await updateProfile(resultado.user, { displayName: nome });

    return resultado.user;
  }

  async loginComEmail(email: string, senha: string) {
    const resultado = await signInWithEmailAndPassword(this.auth, email, senha);

    return resultado.user;
  }

  async obterToken(): Promise<string | null> {
    await this.auth.authStateReady();

    const usuario = this.auth.currentUser;

    return usuario ? await usuario.getIdToken() : null;
  }

}