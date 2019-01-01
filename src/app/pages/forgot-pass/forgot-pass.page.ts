import {Component, OnInit} from '@angular/core';
import {AuthUtilities, RegistrationDetails} from '../../utilities/auth/auth';
import {AuthService} from '../../services/auth/auth.service';
import {AlertController, LoadingController, NavController} from '@ionic/angular';

@Component({
    selector: 'app-forgot-pass',
    templateUrl: './forgot-pass.page.html',
    styleUrls: ['./forgot-pass.page.scss'],
})
export class ForgotPassPage implements OnInit {

    isButtonDisabled = false;
    forgotPassDetails: RegistrationDetails = null;
    hasCodeBeenSent = false;

    constructor(private navController: NavController,
                private authService: AuthService,
                private loadingCtrl: LoadingController,
                private alertCtrl: AlertController) {
        this.forgotPassDetails = new RegistrationDetails();
    }

    ngOnInit() {
    }

    buttonText() {
        if (this.hasCodeBeenSent) {
            return 'Reset Password';
        } else {
            return 'Send Code';
        }
    }

    goToLoginPage() {
        this.navController.navigateBack('/login');
    }

    goToRegisterPage() {
        this.navController.navigateBack('/register');
    }

    doResetPassword() {
        this.isButtonDisabled = true;
        if (this.hasCodeBeenSent) {
            const validationMessage = this.validateInput();
            if (!validationMessage) {
                const email = this.forgotPassDetails.email;
                const password = this.forgotPassDetails.password;
                const code = this.forgotPassDetails.code;
                this.authService.forgotPasswordSubmit(email, code, password).then(() => {
                    AuthUtilities.showAlert(this.alertCtrl, 'Success!', 'You successfully changed your password.');
                    this.navController.navigateForward('/');
                }).catch(err => {
                    const errorMessage = AuthUtilities.extractErrorMessage(err);
                    AuthUtilities.showError(this.alertCtrl, errorMessage);
                    this.isButtonDisabled = false;
                });
            } else {
                AuthUtilities.showError(this.alertCtrl, validationMessage);
                this.isButtonDisabled = false;
            }
        } else {
            if (AuthUtilities.validateEmail(this.forgotPassDetails.email)) {
                this.authService.forgotPassword(this.forgotPassDetails.email).then(() => {
                    this.hasCodeBeenSent = true;
                    AuthUtilities.showAlert(this.alertCtrl, 'Check your email!', 'We just sent you an email.  Get the verification code from the email, then come back here to reset your password.');
                    this.isButtonDisabled = false;
                }).catch(err => {
                    const errorMessage = AuthUtilities.extractErrorMessage(err);
                    AuthUtilities.showError(this.alertCtrl, errorMessage);
                    this.isButtonDisabled = false;
                });
            } else {
                const errorMessage = 'Please enter a valid email address.';
                AuthUtilities.showError(this.alertCtrl, errorMessage);
                this.isButtonDisabled = false;
            }
        }
    }

    validateInput() {
        const email = this.forgotPassDetails.email;
        const validEmail = AuthUtilities.validateEmail(email);
        const code = this.forgotPassDetails.code;
        const password1 = this.forgotPassDetails.password;
        const password2 = this.forgotPassDetails.repeatPassword;
        if (!email) {
            return 'Please enter your email address.';
        } else if (!validEmail) {
            return 'Please enter a valid email address.';
        } else if (code === null || code === '') {
            return 'Please enter the password reset code you found in your email.';
        } else if (password1 != password2) {
            return 'The passwords don\'t match.';
        } else {
            return null;
        }
    }

}
