import {Component, OnInit} from '@angular/core';
import {RewardSystem, RewardSystemService} from '../../services/reward-system/reward-system.service';
import {EventsService, EventTopic} from '../../services/events/events.service';
import {NavController} from '@ionic/angular';

export class DisplayableRewardSystem {
    id: RewardSystem;
    name: String;
    description: String;
    icon: String;
    color: String;
}

@Component({
    selector: 'app-choose-reward-system',
    templateUrl: './choose-reward-system.page.html',
    styleUrls: ['./choose-reward-system.page.scss'],
})
export class ChooseRewardSystemPage implements OnInit {

    rewardSystem: RewardSystem;
    rewardSystems: DisplayableRewardSystem[];

    constructor(private rewardSystemService: RewardSystemService,
                private eventService: EventsService,
                private navController: NavController) {
        this.initializeRewardSystems();
        this.resetPage();
        this.eventService.subscribe(EventTopic.RewardSystemChanged, rewardSystem => {
            this.rewardSystem = rewardSystem;
        });
        this.eventService.subscribe(EventTopic.ClearAll, () => {
            window.setTimeout(() => {
                this.resetPage();
            }, 500);
        });
    }

    ngOnInit() {
    }

    resetPage() {
        this.rewardSystem = this.rewardSystemService.rewardSystem;
    }

    doSaveSelection() {
        this.rewardSystemService.updateRewardSystem(this.rewardSystem);
    }

    doneWithPage() {
        this.navController.navigateForward('/setup/tab/setup-kids');
    }

    private initializeRewardSystems() {
        this.rewardSystems = [
            {
                id: RewardSystem.Money,
                name: 'Money',
                description: 'Want to pay your kids for the work they do?  We\'ll keep track of how much they earn and spend!',
                icon: 'logo-usd',
                color: 'secondary'
            },
            {
                id: RewardSystem.Time,
                name: 'Reward Time',
                description: 'Want to manage how much time your kids spend on devices?  Device time, media time, game time, play time.  You decide!',
                icon: 'logo-game-controller-b',
                color: 'primary'
            },
            {
                id: RewardSystem.Points,
                name: 'Points',
                description: 'Make it a game!  Reward your kids with points for the work they do.',
                icon: 'star-half',
                color: 'royal'
            },
            {
                id: RewardSystem.None,
                name: 'None',
                description: 'Or, if you think learning the value of hard work is reward enough, we\'ll skip the whole reward thing!',
                icon: 'ios-sad',
                color: 'danger'
            }
        ];
    }

}
