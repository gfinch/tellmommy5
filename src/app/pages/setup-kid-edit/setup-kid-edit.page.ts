import {Component, NgZone, OnInit} from '@angular/core';
import {Kid, KidService} from '../../services/kid/kid.service';
import {ActivatedRoute} from '@angular/router';
import {EventsService, EventTopic} from '../../services/events/events.service';
import {AlertController, IonItemSliding, NavController, ToastController} from '@ionic/angular';
import {RewardSystem, RewardSystemService} from '../../services/reward-system/reward-system.service';
import {Account, AccountService} from '../../services/account/account.service';
import {Chore, ChoreService, Frequency} from '../../services/chore/chore.service';

export class DisplayableAccount {
    account: Account;
    split: number;
    editing: boolean;
}

export class DisplayableAssignment {
    chore: Chore;
    frequency: Frequency;
    value: string;
}

@Component({
    selector: 'app-setup-kid-edit',
    templateUrl: './setup-kid-edit.page.html',
    styleUrls: ['./setup-kid-edit.page.scss'],
})
export class SetupKidEditPage implements OnInit {

    undefinedKid = {
        id: '',
        name: '',
        avatar: '/assets/avatars/girl-25.svg',
        deleted: false,
        lastUpdated: -1
    };

    rewardSystem: RewardSystem;
    rewardSystems = RewardSystem;
    kidId: string;
    kidToEdit: Kid;
    uneditedName: string;
    uneditedAccountName: string;
    accounts: DisplayableAccount[] = [];
    accountSliderTimer = null;
    assignments: DisplayableAssignment[] = [];

    constructor(private route: ActivatedRoute,
                private kidService: KidService,
                private rewardSystemService: RewardSystemService,
                private accountService: AccountService,
                private choreService: ChoreService,
                private eventsService: EventsService,
                private navController: NavController,
                private alertController: AlertController,
                private toastController: ToastController,
                private zone: NgZone) {
        this.kidToEdit = this.undefinedKid;
        eventsService.subscribe(EventTopic.RewardSystemChanged, () => {
            this.refreshRewardSystem();
            this.refreshAccounts();
            this.refreshAssignments();
        });
        eventsService.subscribe(EventTopic.KidChanged, (kid: Kid) => {
            if (kid.id == this.kidId && !kid.deleted) {
                this.refreshKid();
            } else if (kid.id == this.kidId && kid.deleted) {
                this.clearPage();
                this.navController.goBack();
            }
        });
        eventsService.subscribe(EventTopic.AccountsChanged, () => {
            this.refreshAccounts();
        });
        eventsService.subscribe(EventTopic.AssignmentChanged, () => {
            this.refreshAssignments();
        });
        eventsService.subscribe(EventTopic.ClearAll, () => {
            this.clearPage();
        });
    }

    ngOnInit() {
        this.kidId = this.route.snapshot.paramMap.get('id');
        this.refreshRewardSystem();
        this.refreshKid();
        this.refreshAccounts();
        this.refreshAssignments();
    }

    private clearPage() {
        this.rewardSystem = RewardSystem.Money;
        this.kidToEdit = this.undefinedKid;
        this.accounts = [];
    }

    private refreshKid() {
        const foundKid = this.kidService.getKid(this.kidId);
        if (foundKid) {
            this.kidToEdit = foundKid;
        } else {
            this.kidToEdit = this.undefinedKid;
        }
    }

    private saveEditedKid() {
        this.kidService.updateKid(this.kidId, this.kidToEdit.name, this.kidToEdit.avatar);
    }

    private deleteKid() {
        this.kidService.deleteKid(this.kidId);
    }

    private focus() {
        this.uneditedName = this.kidToEdit.name;
    }

    private blur() {
        if (!this.kidToEdit.name || this.kidToEdit.name === '') {
            this.kidToEdit.name = this.uneditedName;
        } else {
            this.saveEditedKid();
        }
    }

    private saveButton() {
        this.navController.navigateBack('/setup/tab/setup-kids');
    }

    private deleteButton() {
        this.showAlert(this.kidToEdit.name, 'accounts, ', () => {
            this.navController.navigateBack('/setup/tab/setup-kids').then(() => {
                this.deleteKid();
            });
        });
    }

    private unassignButton(assignment: DisplayableAssignment) {
        const item = <IonItemSliding><any>document.getElementById(assignment.chore.id);
        if (item) {
            item.close();
        }

        this.choreService.unassignChore(assignment.chore.id, this.kidId);
    }

    private chooseNewAvatar() {
        this.navController.navigateForward('/setup/tab/setup-kids/kids/' + this.kidId + '/avatar');
    }

    private startEditingAccount(account: DisplayableAccount) {
        this.uneditedAccountName = account.account.name;
        account.editing = true;
    }

    private updateSplits(account: DisplayableAccount) {
        window.clearTimeout(this.accountSliderTimer);
        this.levelSplits(account);
        this.accountSliderTimer = window.setTimeout(() => {
            this.doUpdateAccount(account);
        }, 1000);
    }

    private levelSplits(account: DisplayableAccount) {
        const kidsAccounts = this.accounts;
        if (kidsAccounts.length === 1) {
            kidsAccounts[0].split = 100;
        } else {
            const values = kidsAccounts.map(acc => {
                return acc.split;
            });
            const sumTotal = values.reduce((a, b) => {
                return a + b;
            }, 0);
            const adjustment = 100 - sumTotal;
            if (adjustment !== 0) {
                this.adjust(account, kidsAccounts, adjustment);
            }
        }
    }

    private adjust(account: DisplayableAccount, accounts: DisplayableAccount[], adjustment: number) {
        const index = accounts.indexOf(account);
        const nextIndex = index + 1 === accounts.length ? 0 : index + 1;
        const otherAccount = accounts[nextIndex];
        if (otherAccount.split + adjustment >= 0) {
            otherAccount.split = otherAccount.split + adjustment;
        } else {
            const remaining = adjustment - otherAccount.split;
            otherAccount.split = 0;
            this.adjust(otherAccount, accounts, remaining);
        }
    }

    private doUpdateAccount(account: DisplayableAccount) {
        if (account.account.name.length > 0) {
            account.editing = false;
            account.account.split = account.split;
            this.accountService.updateAccount(account.account);
        } else {
            account.account.name = this.uneditedAccountName;
            account.editing = false;
        }
    }

    private doDeleteAccount(account: DisplayableAccount) {
        const item = <IonItemSliding><any>document.getElementById(account.account.accountId);
        if (item) {
            item.close();
        }
        this.showAlert(account.account.name, '', () => {
            account.split = 0;
            this.levelSplits(account);
            this.accountService.deleteAccountForKid(this.rewardSystem,
                this.kidId, account.account.accountId);
        });
    }

    private keypressAccount(keyCode, account: DisplayableAccount) {
        if (keyCode == 'Enter') {
            this.doUpdateAccount(account);
        }
    }

    private async showAlert(entityName, accountText, handler) {
        const alert = await this.alertController.create({
            header: 'Are you sure you want to delete ' + entityName + '?',
            message: 'All ' + accountText + 'assignments and rewards will be deleted.  This cannot be undone.',
            buttons: [{
                text: 'No',
                role: 'cancel',
                cssClass: 'primary'
            }, {
                text: 'Yes - Delete',
                cssClass: 'danger',
                handler: handler
            }]
        });

        await alert.present();
    }

    private refreshRewardSystem() {
        this.rewardSystem = this.rewardSystemService.rewardSystem;
    }

    private refreshAccounts() {
        this.zone.run(() => {
            console.log('Refreshing accounts');
            if (this.rewardSystem !== RewardSystem.None) {
                const kidsAccounts = this.accountService.listAccountsForKid(this.rewardSystem, this.kidId);
                console.log('Found ' + kidsAccounts.length + ' accounts for ' + this.kidId + ' - ' + this.rewardSystem + '.');
                this.accounts = kidsAccounts.map((acct => {
                    return {
                        account: acct,
                        split: acct.split,
                        editing: false
                    };
                }));
            }
        });
    }

    private refreshAssignments() {
        this.zone.run(() => {
            console.log('Refreshing assignments');
            const assignments = this.choreService.listAssignmentsForKid(this.kidId);
            console.log('Found ' + assignments.length + ' assignments.');
            this.assignments = assignments.map(assignment => {
                const chore = this.choreService.getChore(assignment.choreId);
                const frequency = assignment.frequency;
                const value = assignment.value.toString();
                return {
                    chore: chore,
                    frequency: frequency,
                    value: value
                };
            });
        });
    }

    private showAccountHelp() {
        this.doShowAccountHelp();
    }

    private addAccount() {
        this.promptForAccountName(data => {
            const accountName = data.accountName;
            const existingAccount = this.accounts.find(account => {
                return account.account.name.toLowerCase() === accountName.toLowerCase();
            });
            if (!existingAccount && accountName !== '') {
                this.accountService.createAccountForKid(this.rewardSystem, this.kidId, accountName);
            }
        });
    }

    private async doShowAccountHelp() {
        const toast = await this.toastController.create({
            message: 'When ' + this.kidToEdit.name + ' does a chore, the reward for the chore is split and deposited into one or more accounts.  Tap to edit an account.  Swipe to delete it.  Click the plus to add a new account.',
            showCloseButton: true,
            duration: 15000,
            closeButtonText: 'Ok'
        });
        toast.present();
    }

    private async promptForAccountName(handler) {
        const alert = await this.alertController.create({
            header: 'New Account',
            message: 'Enter an account name for this new account.',
            inputs: [
                {
                    name: 'accountName',
                    placeholder: 'Account Name'
                }
            ],
            buttons: [{
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'danger'
            }, {
                text: 'Ok',
                cssClass: 'primary',
                handler: handler
            }]
        });
        alert.present();
    }

}
