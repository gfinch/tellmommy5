import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth/auth.service';
import {AlertController, LoadingController} from '@ionic/angular';
import {AuthUtilities, RegistrationDetails} from '../../utilities/auth/auth';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

    isButtonDisabled = false;
    loginDetails: RegistrationDetails = null;

    constructor(private router: Router, private authService: AuthService,
                private loadingCtrl: LoadingController,
                private alertCtrl: AlertController) {
        this.loginDetails = new RegistrationDetails();
    }

    ngOnInit() {
    }

    goToRegisterPage() {
        this.router.navigate(['/register']);
    }

    goToForgotPassPage() {
        this.router.navigate(['/forgot-pass']);
    }

    doLogin() {
        this.isButtonDisabled = true;
        const validationMessage = this.validateInput();

        if (!validationMessage) {
            AuthUtilities.createLoader(this.loadingCtrl, 'Signing In ...').then(loader => {
                loader.present();
                const email = this.loginDetails.email;
                const password = this.loginDetails.password;

                console.log(email + ' ... ' + password);

                this.authService.signIn(email, password).then(username => {
                    console.log(username + ' logged in.');
                    loader.dismiss();
                    this.isButtonDisabled = false;
                }).catch(err => {
                    console.log(JSON.stringify(err));
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

    private validateInput() {
        const email = this.loginDetails.email;
        const password = this.loginDetails.password;
        if (!AuthUtilities.validateEmail(email)) {
            return 'Please enter a valid email address.';
        } else if (password === null || password.length === 0) {
            return 'Please enter a password.';
        } else {
            return null;
        }
    }
}
