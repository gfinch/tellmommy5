import {Component, OnInit} from '@angular/core';
import {ChoreService} from '../../services/chore/chore.service';
import {AccountTransaction, BankService, DisplayableAccount} from '../../services/bank/bank.service';
import {ActivatedRoute} from '@angular/router';
import {RewardSystem, RewardSystemService} from '../../services/reward-system/reward-system.service';
import {Kid, KidService} from '../../services/kid/kid.service';
import {Account, AccountService} from '../../services/account/account.service';
import {EventsService, EventTopic} from '../../services/events/events.service';
import * as moment from 'moment';
import {ChoreChartService} from '../../services/chore-chart/chore-chart.service';
import {AlertController, IonItemSliding} from '@ionic/angular';

export class DisplayableTransaction {
    accountTransaction: AccountTransaction;
    choreIcon: string;
    positive: boolean;
    transactionTime: string;
}

@Component({
    selector: 'app-view-edit-kids-account',
    templateUrl: './view-edit-kids-account.page.html',
    styleUrls: ['./view-edit-kids-account.page.scss'],
})
export class ViewEditKidsAccountPage implements OnInit {

    rewardSystem: RewardSystem;
    kid: Kid;
    kidId: string;
    account: Account;
    accountId: string;
    accountTotal: DisplayableAccount;
    transactions: DisplayableTransaction[] = [];

    constructor(private route: ActivatedRoute,
                private rewardSystemService: RewardSystemService,
                private kidService: KidService,
                private accountService: AccountService,
                private choreService: ChoreService,
                private choreChartService: ChoreChartService,
                private bankService: BankService,
                private eventService: EventsService,
                private alertController: AlertController) {
        this.eventService.subscribe(EventTopic.RewardSystemChanged, () => {
            this.refresh();
        });
        this.eventService.subscribe(EventTopic.KidChanged, () => {
            this.refresh();
        });
        this.eventService.subscribe(EventTopic.AccountsChanged, () => {
            this.refresh();
        });
        this.eventService.subscribe(EventTopic.Deposit, () => {
            this.refresh();
        });
    }

    ngOnInit() {
        this.refresh();
    }

    refresh() {
        this.rewardSystem = this.rewardSystemService.rewardSystem;
        this.kidId = this.route.snapshot.paramMap.get('kidId');
        this.kid = this.kidService.getKid(this.kidId);
        this.accountId = this.route.snapshot.paramMap.get('accountId');
        this.account = this.accountService.getAccountById(this.accountId);
        this.accountTotal = this.bankService.accountTotal(this.rewardSystem, this.kidId, this.accountId);
        this.transactions = this.buildTransactions();
    }

    private buildTransactions(): DisplayableTransaction[] {
        return this.bankService.accountTransactions(this.rewardSystem, this.kidId, this.accountId).map(accountTransaction => {
            let choreIcon = null;
            if (accountTransaction.assignmentTransactionId) {
                const assignment = this.choreChartService.findAssignment(accountTransaction.assignmentTransactionId);
                if (assignment) {
                    const chore = this.choreService.getChore(assignment.choreId);
                    if (chore) {
                        choreIcon = chore.icon;
                    }
                }
            }
            const positive = accountTransaction.value >= 0;
            const transactionTime = moment(accountTransaction.timestamp).fromNow();
            return {
                accountTransaction: accountTransaction,
                choreIcon: choreIcon,
                positive: positive,
                transactionTime: transactionTime
            };
        });
    }

    private deleteTransaction(displayableTransaction: DisplayableTransaction) {
        const accountTransaction = displayableTransaction.accountTransaction;
        const item = <IonItemSliding><any>document.getElementById(accountTransaction.id);
        if (item) {
            item.close();
        }

        if (accountTransaction.assignmentTransactionId && displayableTransaction.choreIcon) {
            this.choreChartService.uncompleteChoreByTransactionId(this.kidId, accountTransaction.assignmentTransactionId);
        } else {
            this.bankService.cancelDeposit(this.rewardSystem, this.kidId, this.accountId, accountTransaction.id);
        }
    }

    private earnButton() {
        this.promptForDebit('Earn', 'How much did you earn?', 'How did you earn it?', (result => {
            let amount = Number(result.amount);
            if (this.rewardSystem == RewardSystem.Money) {
                amount = amount * 100;
            }
            this.bankService.depositToOneAccount(this.rewardSystem, this.kidId, this.accountId, amount, result.memo);
        }));
    }

    private spendButton() {
        this.promptForDebit('Spend', 'How much did you spend?', 'What did you spend it on?', (result => {
            let amount = Number(result.amount);
            if (this.rewardSystem == RewardSystem.Money) {
                amount = amount * 100;
            }
            this.bankService.depositToOneAccount(this.rewardSystem, this.kidId, this.accountId, amount * -1, result.memo);
        }));
    }

    private async promptForDebit(header, message, memo, handler) {
        let placeholder = '';
        if (this.account.rewardSystem === RewardSystem.Money) {
            placeholder = '$';
        } else if (this.account.rewardSystem === RewardSystem.Time) {
            placeholder = 'minutes';
        } else if (this.account.rewardSystem === RewardSystem.Points) {
            placeholder = 'points';
        }
        const alert = await this.alertController.create({
            header: header,
            message: message,
            inputs: [
                {
                    name: 'amount',
                    placeholder: placeholder,
                    type: 'number',
                    min: 0,
                },
                {
                    name: 'memo',
                    placeholder: memo,
                    type: 'text'
                }
            ],
            buttons: [{
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'danger'
            }, {
                text: header,
                cssClass: 'primary',
                handler: handler
            }]
        });
        alert.present();
    }

}
