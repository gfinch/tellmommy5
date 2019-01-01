import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth/auth.service';
import {AlertController, LoadingController, NavController} from '@ionic/angular';
import {AuthUtilities, RegistrationDetails} from '../../utilities/auth/auth';

@Component({
    selector: 'app-register',
    templateUrl: './register.page.html',
    styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

    public registrationDetails: RegistrationDetails;
    public isButtonDisabled = false;

    constructor(private navController: NavController, private authService: AuthService,
                private loadingCtrl: LoadingController,
                private alertCtrl: AlertController) {
        this.registrationDetails = new RegistrationDetails();
    }

    ngOnInit() {
    }

    goToLoginPage() {
        this.navController.navigateForward('/login');
    }

    doRegister() {
        this.isButtonDisabled = true;
        const validationMessage = this.validateInput();

        if (!validationMessage) {
            AuthUtilities.createLoader(this.loadingCtrl, 'Registering ...').then(loader => {
                loader.present();
                const email = this.registrationDetails.email;
                const password = this.registrationDetails.password;

                this.authService.signUp(email, password).then(registeredUserName => {
                    console.log(registeredUserName + ' registered.');
                    this.authService.signIn(email, password).then(signedInUserName => {
                        console.log(signedInUserName + ' logged in.');
                        loader.dismiss();
                        this.isButtonDisabled = false;
                        this.navController.navigateForward('/');
                    }).catch(err => {
                        loader.dismiss();
                        this.isButtonDisabled = false;
                        const errorMessage = AuthUtilities.extractErrorMessage(err);
                        AuthUtilities.showError(this.alertCtrl, errorMessage);
                    });
                }).catch(err => {
                    loader.dismiss();
                    this.isButtonDisabled = false;
                    const errorMessage = AuthUtilities.extractErrorMessage(err);
                    AuthUtilities.showError(this.alertCtrl, errorMessage);
                });
            });
        } else {
            AuthUtilities.showError(this.alertCtrl, validationMessage);
            this.isButtonDisabled = false;
        }
    }

    validateInput() {
        const email = this.registrationDetails.email;
        const validEmail = AuthUtilities.validateEmail(email);
        const password1 = this.registrationDetails.password;
        const password2 = this.registrationDetails.repeatPassword;
        console.log(password1);
        console.log(password2);
        if (!email) {
            return 'Please enter your email address.';
        } else if (!validEmail) {
            return 'Please enter a valid email address.';
        } else if (password1 != password2) {
            return 'The passwords don\'t match.';
        } else {
            return null;
        }
    }

}
