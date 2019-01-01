import {Component} from '@angular/core';

import {NavController, Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {AuthService} from './services/auth/auth.service';
import {StorageService} from './services/storage/storage.service';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private authService: AuthService,
        private storageService: StorageService,
        private navController: NavController
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();
        });
    }

    doSignOut() {
        console.log('Preparing to sign out.');
        this.authService.signOut().then(() => {
            console.log('Preparing to clear storage.');
            return this.storageService.clear().then(() => {
                console.log('Preparing to navigate to home.');
                return this.navController.navigateRoot('/register');
            });
        }).catch((err) => {
            console.log(err);
        });
    }
}
