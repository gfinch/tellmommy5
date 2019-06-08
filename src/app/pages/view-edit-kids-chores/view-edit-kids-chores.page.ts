import {Component, OnInit} from '@angular/core';
import {Kid, KidService} from '../../services/kid/kid.service';
import {ActivatedRoute} from '@angular/router';
import {ChoreChartService, CompletableChore, ReportingGroup} from '../../services/chore-chart/chore-chart.service';
import {EventsService, EventTopic} from '../../services/events/events.service';
import {BankService, DisplayableAccount} from '../../services/bank/bank.service';
import {Account} from '../../services/account/account.service';
import {RewardSystem, RewardSystemService} from '../../services/reward-system/reward-system.service';
import {NavigationService, Page} from '../../services/navigation/navigation.service';

export class FinishedGroup {
    reportingGroup: ReportingGroup;
    isOpen: boolean;
    name: string;
}

@Component({
    selector: 'app-view-edit-kids-chores',
    templateUrl: './view-edit-kids-chores.page.html',
    styleUrls: ['./view-edit-kids-chores.page.scss'],
})
export class ViewEditKidsChoresPage implements OnInit {
    rewardSystem: RewardSystem;
    kidId: string;
    kid: Kid;
    remainingChores: CompletableChore[];
    otherChores: Map<ReportingGroup, CompletableChore[]>;
    accountTotals: DisplayableAccount[];
    segment = 'todo';
    finishedGroups: FinishedGroup[] = [{
        reportingGroup: ReportingGroup.FinishedToday,
        isOpen: false,
        name: 'Today'
    }, {
        reportingGroup: ReportingGroup.EndedYesterday,
        isOpen: false,
        name: 'Yesterday'
    }, {
        reportingGroup: ReportingGroup.EndedThisWeek,
        isOpen: false,
        name: 'Earlier this week'
    }, {
        reportingGroup: ReportingGroup.EndedLastWeek,
        isOpen: false,
        name: 'Last week'
    }, {
        reportingGroup: ReportingGroup.EndedTwoWeeksAgo,
        isOpen: false,
        name: 'Two weeks ago'
    }];

    constructor(private route: ActivatedRoute,
                private kidService: KidService,
                private choreChartService: ChoreChartService,
                private rewardSystemService: RewardSystemService,
                private bankService: BankService,
                private eventService: EventsService,
                private navigationService: NavigationService) {
        eventService.subscribe(EventTopic.AssignmentChanged, () => {
            this.refresh();
        });
        eventService.subscribe(EventTopic.KidChanged, (kid: Kid) => {
            if (kid.id == this.kidId) {
                this.refresh();
            }
        });
        eventService.subscribe(EventTopic.DoAssignment, () => {
            this.refresh();
        });
        eventService.subscribe(EventTopic.Deposit, () => {
            this.refresh();
        });
    }

    ngOnInit() {
        this.refresh();
    }

    refresh() {
        this.refreshRecursive(this.route, this.kidService, this.rewardSystemService,
            this.choreChartService, this.bankService);
    }

    refreshRecursive(route: ActivatedRoute, kidService: KidService, rewardSystemService: RewardSystemService,
                     choreChartService: ChoreChartService, bankService: BankService) {
        this.kidId = route.snapshot.paramMap.get('id');
        this.kid = kidService.getKid(this.kidId);
        this.rewardSystem = rewardSystemService.rewardSystem;
        if (this.kid) {
            const choreChart = choreChartService.makeChoreChartForKid(this.kid);
            this.remainingChores = choreChart.get(ReportingGroup.Remaining);
            choreChart.delete(ReportingGroup.Remaining);
            this.otherChores = choreChart;
            this.accountTotals = bankService.accountTotals(this.rewardSystem, this.kidId);
        } else {
            window.setTimeout(() => {
                this.refreshRecursive(route, kidService, rewardSystemService, choreChartService, bankService);
            }, 200);
        }
    }

    toggleChore(completableChore: CompletableChore) {
        if (!completableChore.completed) {
            this.choreChartService.completeChore(completableChore);
        } else {
            this.choreChartService.uncompleteChore(completableChore);
        }
    }

    toggleGroup(group: FinishedGroup) {
        group.isOpen = !group.isOpen;
    }

    goToAccountPage(account: Account) {
        this.navigationService.navigateForward(Page.ViewEditKidsAccount, [account.kidId, account.accountId]);
    }

}
