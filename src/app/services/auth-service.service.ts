import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
// import { resolve } from 'dns';
import * as firebase from 'firebase';

// import moduleName from ''
@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  constructor(private fireAuth: AngularFireAuth) {}

  getWindoRef() {
    return window; // This is the global js object
  }


  phoneAuthCheck(phone, verifier): Promise<any> {
    return new Promise((resolv, reject) => {
      // Firebase Auth library in angular/fire
      this.fireAuth.auth.signInWithPhoneNumber(phone, verifier).then((result) => {
        // Now we will recive the verificcation code from firebase
        resolv(result);
      }).catch((error) => {
        reject(error);
        console.log('Error', error);
      });
    });
  }
}
