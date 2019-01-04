import {Component} from '@angular/core';

import {NavController, Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {AuthService} from './services/auth/auth.service';
import {StorageService} from './services/storage/storage.service';
import {EventsService, EventTopic} from './services/events/events.service';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private authService: AuthService,
        private storageService: StorageService,
        private navController: NavController,
        private eventsService: EventsService
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.splashScreen.hide();
        });
    }

    doSignOut() {
        console.log('Preparing to sign out.');
        this.authService.signOut().then(() => {
            console.log('Preparing to clear storage.');
            return this.storageService.clear().then(() => {
                console.log('Preparing to navigate to home.');
                this.eventsService.publish(EventTopic.ClearAll, {});
                return this.navController.navigateRoot('');
            });
        }).catch((err) => {
            console.log(err);
        });
    }
}
