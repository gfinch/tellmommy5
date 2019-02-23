import {Injectable} from '@angular/core';
import {NavController} from '@ionic/angular';

export enum Page {
    Register = 'Register',
    Login = 'Login',
    ForgotPass = 'ForgotPass',
    Home = 'Home',
    SetupRewardSystem = 'SetupRewardSystem',
    SetupKids = 'SetupKids',
    SetupKidEdit = 'SetupKidEdit',
    ChooseAvatar = 'ChooseAvatar',
    SetupChores = 'SetupChores',
    SetupChoreEdit = 'SetupChoreEdit',
    ChooseAKid = 'ChooseAKid',
    ViewEditKidsChores = 'ViewEditKidsChores',
    ViewEditKidsAccount = 'ViewEditKidsAccount'
}

@Injectable({
    providedIn: 'root'
})
export class NavigationService {

    navigationMap = new Map<Page, string>([
        [Page.Register, 'register'],
        [Page.Login, 'login'],
        [Page.ForgotPass, 'forgot-pass'],
        [Page.Home, 'choose-a-kid'],
        [Page.SetupRewardSystem, '/setup/tab/choose-reward-system'],
        [Page.SetupKids, '/setup/tab/setup-kids'],
        [Page.SetupKidEdit, '/setup/tab/setup-kids/kids/?'],
        [Page.ChooseAvatar, '/setup/tab/setup-kids/kids/?/avatar'],
        [Page.SetupChores, '/setup/tab/setup-chores'],
        [Page.SetupChoreEdit, '/setup/tab/setup-chores/chores/?'],
        [Page.ChooseAKid, 'choose-a-kid'],
        [Page.ViewEditKidsChores, 'view-edit-kids-chores/?'],
        [Page.ViewEditKidsAccount, 'view-edit-kids-account/?/?'],
    ]);

    constructor(private navController: NavController) {
    }

    navigateRoot(page: Page, params?: string[]) {
        return this.navController.navigateRoot(this.buildUrl(page, params));
    }

    navigateForward(page: Page, params?: string[]) {
        return this.navController.navigateForward(this.buildUrl(page, params));
    }

    navigateBack(page: Page, params?: string[]) {
        return this.navController.navigateBack(this.buildUrl(page, params));
    }

    goBack() {
        return this.navController.goBack();
    }

    private buildUrl(page: Page, params?: string[]): string {
        let url = this.navigationMap.get(page);
        if (params) {
            for (let i = 0; i < params.length; i++) {
                url = url.replace('?', params[i]);
            }
        }
        console.log('Navigating to: ' + url);
        return url;
    }
}
