import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
// declare var SMSReceive: any;
declare var SMSRetriever: any;
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationEvents, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation/ngx';
import { AuthServiceService } from '../services/auth-service.service';
import * as firebase from 'firebase';
import { PDFGenerator } from '@ionic-native/pdf-generator/ngx';

import { Kommunicate } from '@ionic-native/kommunicate/ngx';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  config: BackgroundGeolocationConfig = {
    desiredAccuracy: 10,
    stationaryRadius: 20,
    distanceFilter: 30,
    debug: true, //  enable this hear sounds for background-geolocation life-cycle.
    stopOnTerminate: false, // enable this to clear background location settings when the app terminates
  };
  OTP: string = '';
  Code: any;
  PhoneNo: any;
  showOTPInput: boolean = false;
  OTPmessage: string = 'An OTP is sent to your number. You should receive it in 15 s'
  wRef: any;
  content: string;
  kmUser = {
    'userId' : 'vgehani90@gmail.com',   //Replace it with the userId of the logged in user
    'password' : 'jaimatade@123',  //Put password here
    'authenticationTypeId' : 1,
    'imageLink' : '',
    'applicationId' : '35eae72aae198269720c44fdebe596761',  //replace this with your APP_ID from Applozic Dashboard
    'deviceApnsType' : 0    //Set 0 for Development and 1 for Distribution (Release)
  };
  // conversationObject = {
  //   'appId' : '35eae72aae198269720c44fdebe596761',
  //   'kmUser' : JSON.stringify(this.kmUser)
  //   // The [APP_ID](https://dashboard.kommunicate.io/settings/install) obtained from kommunicate dashboard.
  // };
  conversationObject = {
    'appId' : '35eae72aae198269720c44fdebe596761',
    'isUnique' : false,
    'agentIds':['vgehani90@gmail.com'],  //List of agentIds. AGENT_ID is the emailID used to signup on Kommunicate
    'botIds': ['botiya-7k4jd']
    // The [APP_ID](https://dashboard.kommunicate.io/settings/install) obtained from kommunicate dashboard.
  };
  clientKey: any;
  constructor(private toastCtrl: ToastController,
              private backgroundGeolocation: BackgroundGeolocation,
              private authService: AuthServiceService,
              private pdfGenerator: PDFGenerator,
              private kommunicate: Kommunicate
              ){
                this.initateBot();
              }
              // 51498095
  initateBot() {
    console.log('Obj', this.conversationObject)
    this.kommunicate.conversationBuilder(this.conversationObject)
    .then((clientChannelKey: any) => {
    this.clientKey = clientChannelKey;
    console.log('client', clientChannelKey);
    this.kommunicate.login(this.kmUser)
    .then((response : any) => {
       console.log('success login', response);
    })
    .catch((error1 : any) => {
       console.log('login error', error1);
    })
    }).catch((error: any) => console.error("Error creating conversation." + error));
  }


  async ionViewWillEnter(){
    this.wRef = await this.authService.getWindoRef(); // This returns the window object

    // below line make the recaptcha ready 
    this.wRef.recaptchaVerifier = await new firebase.auth.RecaptchaVerifier('recaptcha-container');
    // renders the recaptcha to the Home screen
    await this.wRef.recaptchaVerifier.render();
  }









  async presentToast(message, show_button, position, duration) {
    const toast = await this.toastCtrl.create({
      message: message,
      // showCloseButton: show_button,
      position: position,
      duration: duration
    });
    toast.present();
  }






  // Button event after the nmber is entered and button is clicked
  async next() {
    this.kommunicate.launchParticularConversation({
      'clientChannelKey' : this.clientKey, // pass the clientChannelKey here
      'takeOrder' : true // skip chat list on back press, pass false if you want to show chat list on back press
    })
   .then((response : any) => { console.log('res', response); /*conversation sucessfully launched*/ })
   .catch((error : any) => { console.log('err', error); /*error occurred*/ });
    // this.content = document.getElementById('printTable').innerHTML;
    // console.log('Content', this.content);
    // let options = {
    //   documentSize: 'A4',
    //   type: 'share',
    //   fileName: 'my-pdf.pdf'
    // };
    // this.pdfGenerator.fromData(this.content, options)
    // .then((base64) => {
    //   console.log('OK', base64);
    // }).catch((error) => {
    //   console.log('error', error);
    // });
    // console.log('Num', this.PhoneNo); // input phone no.
    // const appVerifier = this.wRef.recaptchaVerifier; // valid recaptcha
    // const phoneResult = await this.authService.phoneAuthCheck(this.PhoneNo, appVerifier);
    // console.log('Home Result', phoneResult);
    // this.wRef.confirmationResult = phoneResult;
  }








  start() {
    SMSRetriever.startWatch(
      () => {
        console.log('watch started');
        document.addEventListener('onSMSArrive', (e: any) => {
          console.log('onSMSArrive()');
          var IncomingSMS = e.data;
          console.log('sms.address:' + IncomingSMS.address);
          console.log('sms.body:' + IncomingSMS.body);
          /* Debug received SMS content (JSON) */
          console.log(JSON.stringify(IncomingSMS));
          this.processSMS(IncomingSMS);
        });
      },
      () => { console.log('watch start failed') }
    )
  }

  stop() {
    SMSRetriever.stopWatch(
      () => { console.log('watch stopped') },
      () => { console.log('watch stop failed') }
    )
  }

  processSMS(data) {
    // Check SMS for a specific string sequence to identify it is you SMS
    // Design your SMS in a way so you can identify the OTP quickly i.e. first 6 letters
    // In this case, I am keeping the first 6 letters as OTP
    const message = data.body;
    if (message && message.indexOf('enappd_starters') != -1) {
      this.OTP = data.body.slice(0, 6);
      console.log(this.OTP);
      this.OTPmessage = 'OTP received. Proceed to register'
      this.stop();
    }
  }








  // Button click after the verfication code is entered into inp box
  register() {
    console.log('Code', this.Code); // code from message
    this.wRef.confirmationResult.confirm(this.Code) // validates the code 
    .then(async result => {
      console.log('Home Result', result); // success code 
    })
    .catch(err => {
     console.log('err2', err); // wrong code entered 
    });
  }
 
  // Now we will see  the number in firebase console

}
