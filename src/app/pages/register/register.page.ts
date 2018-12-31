import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth/auth.service';
import {AlertController, LoadingController} from '@ionic/angular';
import {Router} from '@angular/router';
import {AuthUtilities, RegistrationDetails} from '../../utilities/auth/auth';

@Component({
    selector: 'app-register',
    templateUrl: './register.page.html',
    styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

    public registrationDetails: RegistrationDetails;
    public isButtonDisabled = false;

    constructor(private router: Router, private authService: AuthService,
                private loadingCtrl: LoadingController,
                private alertCtrl: AlertController) {
        this.registrationDetails = new RegistrationDetails();
    }

    ngOnInit() {
    }

    goToLoginPage() {
        this.router.navigate(['/login']);
    }

    doRegister() {
        this.isButtonDisabled = true;
        const validationMessage = this.validateInput();

        if (!validationMessage) {
            AuthUtilities.createLoader(this.loadingCtrl, 'Registering ...').then(loader => {
                loader.present();
                const email = this.registrationDetails.email;
                const password = this.registrationDetails.password;

                this.authService.signUp(email, password).then(username => {
                    console.log(username + ' registered.');
                    loader.dismiss();
                    this.isButtonDisabled = false;
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
