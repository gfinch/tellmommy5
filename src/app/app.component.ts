import {Component} from '@angular/core';

import {NavController, Platform} from '@ionic/angular';
import {AuthService} from './services/auth/auth.service';
import {StorageService} from './services/storage/storage.service';
import {EventsService, EventTopic} from './services/events/events.service';
import {TestDataService} from './services/test-data/test-data.service';
import {AccountService} from './services/account/account.service';
import {BankService} from './services/bank/bank.service';
import {ChoreService} from './services/chore/chore.service';
import {ChoreChartService} from './services/chore-chart/chore-chart.service';
import {RewardSystemService} from './services/reward-system/reward-system.service';
import {KidService} from './services/kid/kid.service';
import {Capacitor, Plugins} from '@capacitor/core';

const {SplashScreen} = Plugins;

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    constructor(
        private platform: Platform,
        private authService: AuthService,
        private storageService: StorageService,
        private navController: NavController,
        private eventsService: EventsService,
        private testDataService: TestDataService,
        private accountService: AccountService,
        private bankService: BankService,
        private choreService: ChoreService,
        private choreChartService: ChoreChartService,
        private rewardSystemService: RewardSystemService,
        private kidService: KidService
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.waitForServicesToInitialize(() => {
                if (Capacitor.isPluginAvailable('SplashScreen')) {
                    SplashScreen.hide();
                }
            });
        });
    }

    waitForServicesToInitialize(callback) {
        if (this.accountService.initialized && this.bankService.initialized &&
            this.choreService.initialized && this.choreChartService.initialized &&
            this.rewardSystemService.initialized && this.kidService.initialized) {
            callback();
        } else {
            window.setTimeout(() => {
                this.waitForServicesToInitialize(callback);
            }, 100);
        }
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

    doRewardSystem() {
        this.navController.navigateRoot('/setup/tab/choose-reward-system');
    }

    doSetupKids() {
        this.navController.navigateRoot('/setup/tab/setup-kids');
    }

    doSetupChores() {
        this.navController.navigateRoot('/setup/tab/setup-chores');
    }

    doChooseAKid() {
        this.navController.navigateRoot('/choose-a-kid');
    }

    doGenerateRandom() {
        this.testDataService.generate();
    }
}
