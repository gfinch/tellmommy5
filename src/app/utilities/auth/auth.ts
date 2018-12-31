import {AlertController, LoadingController} from '@ionic/angular';

export class RegistrationDetails {
    email: string;
    password: string;
    repeatPassword: string;
    code: string;
}

export class AuthUtilities {
    static async createLoader(loadingController: LoadingController, message: string) {
        return loadingController.create({
            message: message
        });
    }

    static async showAlert(alertController: AlertController, header, err) {
        const alert = await alertController.create({
            header: header,
            subHeader: err,
            buttons: ['OK']
        });

        await alert.present();
    }

    static async showError(alertController: AlertController, err) {
        return await this.showAlert(alertController, 'Oops!', err);
    }

    static extractErrorMessage(err) {
        if (err.code === 'UsernameExistsException') {
            return 'This email address is already registered.  Tap on `Already Registered` to sign in.';
        } else if (err.code === 'InvalidPasswordException' || err.code === 'InvalidParameterException') {
            return 'Your password is invalid.  Include at least 6 characters with uppercase, lowercase, and numeric characters.';
        } else if (err.code === 'UserNotFoundException') {
            return 'This email address isn\'t registered.  Tap on `Not Registered` to get started.';
        } else if (err.code === 'NotAuthorizedException') {
            return 'Invalid email address or password.  Please try again.';
        } else if (err.code === 'CodeMismatchException') {
            return 'The verification code you entered is invalid.  Please try again.';
        } else if (err.code === 'LimitExceededException') {
            return 'You\'ve reached the limit on the number of verification codes we can send you for now.  Try again in a couple of hours.';
        } else {
            return 'An unexpected error occurred and we were not able to sign you in.  Please try again.  If the problem continues, please email support@mamabird.biz for assistance.';
        }
    }

    static validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
}
