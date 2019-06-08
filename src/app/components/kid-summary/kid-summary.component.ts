import {Component} from '@angular/core';
import {RewardSystem, RewardSystemService} from '../../services/reward-system/reward-system.service';
import {Kid, KidService} from '../../services/kid/kid.service';
import {BankService, DisplayableAccount} from '../../services/bank/bank.service';
import {NavigationService, Page} from '../../services/navigation/navigation.service';
import {ChoreChartService} from '../../services/chore-chart/chore-chart.service';
import {EventsService, EventTopic} from '../../services/events/events.service';

@Component({
    selector: 'app-kid-summary',
    templateUrl: './kid-summary.component.html',
    styleUrls: ['./kid-summary.component.scss']
})
export class KidSummaryComponent {

    rewardSystem: RewardSystem;
    kids: Array<Kid> = [];
    kidsAccounts: Map<Kid, DisplayableAccount[]> = new Map();

    constructor(private navigationService: NavigationService,
                private rewardSystemService: RewardSystemService,
                private kidService: KidService,
                private choreChartService: ChoreChartService,
                private bankService: BankService,
                private eventService: EventsService) {
        this.refresh();
        this.eventService.subscribe(EventTopic.RewardSystemChanged, () => {
            this.refresh();
        });
        this.eventService.subscribe(EventTopic.KidChanged, () => {
            this.refresh();
        });
        this.eventService.subscribe(EventTopic.DoAssignment, () => {
            this.refresh();
        });
        this.eventService.subscribe(EventTopic.AccountsChanged, () => {
            this.refresh();
        });
        this.eventService.subscribe(EventTopic.Deposit, () => {
            this.refresh();
        });
    }

    refresh() {
        this.rewardSystem = this.rewardSystemService.rewardSystem;
        this.kids = this.kidService.listKids();
        this.kids.forEach(kid => {
            this.kidsAccounts.set(kid, this.bankService.accountTotals(this.rewardSystem, kid.id));
        });
    }

    getRemainingChoreCount(kid: Kid) {
        return 0;
    }

    goToKidPage(kid: Kid) {
        this.navigationService.navigateForward(Page.ViewEditKidsChores, [kid.id]);
    }

    editAvatar(kid: Kid) {
        this.navigationService.navigateForward(Page.ChooseAvatar, [kid.id]);
    }

    viewAccount(kid: Kid, account: Account) {
        this.navigationService.navigateForward(Page.ViewEditKidsAccount, [kid.id, account.id]);
    }

    editKid(kid: Kid) {
        this.navigationService.navigateForward(Page.SetupKidEdit, [kid.id]);
    }

    getAccountColumnWidth(kid: Kid) {
        const accounts = this.kidsAccounts.get(kid);
        let width = 12;
        if (accounts.length > 0) {
            if (accounts.length % 3 === 0) {
                width = 4;
            } else if (accounts.length % 2 === 0) {
                width = 6;
            } else if (accounts.length === 1) {
                width = 12;
            } else {
                width = 4;
            }
        }
        return width;
    }

}
