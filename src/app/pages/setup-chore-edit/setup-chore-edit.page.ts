import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Chore, ChoreService, Frequency} from '../../services/chore/chore.service';
import {RewardSystem, RewardSystemService} from '../../services/reward-system/reward-system.service';
import {EventsService, EventTopic} from '../../services/events/events.service';
import {NavController, ToastController} from '@ionic/angular';
import {KidService} from '../../services/kid/kid.service';

export class KidCheck {
    id: string;
    name: string;
    checked: boolean;
}

@Component({
    selector: 'app-setup-chore-edit',
    templateUrl: './setup-chore-edit.page.html',
    styleUrls: ['./setup-chore-edit.page.scss'],
})
export class SetupChoreEditPage implements OnInit {

    undefinedChore = {
        id: '',
        name: '',
        category: '',
        value: 0,
        icon: '',
        author: '',
        sort: 0
    };

    private choreId: string;
    private choreToEdit: Chore = this.undefinedChore;
    private choreValue = '';
    private choreFrequency: Frequency = Frequency.Daily;
    private rewardSystem: RewardSystem = RewardSystem.None;
    private labelLeft = false;
    private editLabel = '';
    private isNoRewardSystem = true;
    private kidChecks: KidCheck[];

    frequencies = [
        {'id': Frequency.TwiceDaily, 'name': 'Twice daily'},
        {'id': Frequency.Daily, 'name': 'Daily'},
        {'id': Frequency.Weekly, 'name': 'Weekly'},
        {'id': Frequency.Monthly, 'name': 'Monthly'},
        {'id': Frequency.OneTime, 'name': 'One time only'}
    ];

    constructor(private route: ActivatedRoute,
                private eventsService: EventsService,
                private toastController: ToastController,
                private navController: NavController,
                private choreService: ChoreService,
                private rewardSystemService: RewardSystemService,
                private kidService: KidService) {
        this.eventsService.subscribe(EventTopic.RewardSystemChanged, () => {
            this.refresh();
        });
        this.eventsService.subscribe(EventTopic.ChoreListChanged, () => {
            this.refresh();
        });
        this.eventsService.subscribe(EventTopic.KidChanged, () => {
            this.refresh();
        });
        this.eventsService.subscribe(EventTopic.AssignmentChanged, () => {
            this.refresh();
        });
    }

    ngOnInit() {
        this.choreId = this.route.snapshot.paramMap.get('id');
        this.refresh();
    }

    private refresh() {
        this.choreToEdit = this.choreService.getChore(this.choreId);
        this.rewardSystem = this.rewardSystemService.rewardSystem;
        this.isNoRewardSystem = this.rewardSystem === RewardSystem.None;
        this.buildRewardSystemLabel();
        this.buildChoreValue();
        this.buildKidChecks();
        this.buildChoreFrequency();
    }

    private buildChoreValue() {
        const existingAssignments = this.choreService.listAssignmentsForChore(this.choreId);
        const storedValue =
            existingAssignments.length > 0 ? existingAssignments[0].value : this.choreToEdit.value;
        this.choreValue =
            this.rewardSystem === RewardSystem.Money ? (storedValue / 100).toFixed(2) : storedValue + '';
    }

    private buildRewardSystemLabel() {
        this.labelLeft = this.rewardSystem === RewardSystem.Money;
        this.editLabel =
            this.rewardSystem === RewardSystem.Money ? '$' :
                this.rewardSystem === RewardSystem.Time ? 'minutes' :
                    this.rewardSystem === RewardSystem.Points ? 'points' : '';
    }

    private buildKidChecks() {
        const allKids = this.kidService.listKids();
        const alwaysCheck = allKids.length === 1;
        this.kidChecks = allKids.map(kid => {
            const isAssigned = alwaysCheck || this.choreService.isKidAssignedChore(kid.id, this.choreId);
            return {
                id: kid.id,
                name: kid.name,
                checked: isAssigned
            };
        });
    }

    private buildChoreFrequency() {
        const existingAssignments = this.choreService.listAssignmentsForChore(this.choreId);
        this.choreFrequency =
            existingAssignments.length > 0 ? existingAssignments[0].frequency : Frequency.Daily;
    }

    private doneWithPage() {
        this.save();
        this.navController.navigateBack('/setup/tab/setup-chores');
    }

    private save() {
        const value = this.rewardSystem == RewardSystem.Money ? (Number(this.choreValue) * 100) : Number(this.choreValue);
        const frequency = this.choreFrequency;
        this.kidChecks.forEach(kidCheck => {
            if (kidCheck.checked) {
                console.log('Assigning chores!');
                this.choreService.assignChore(this.choreId, kidCheck.id, value, frequency);
            } else {
                console.log('Unassigning chore!');
                this.choreService.unassignChore(this.choreId, kidCheck.id);
            }
        });
    }

    private async doShowFrequencyHelp() {
        const toast = await this.toastController.create({
            message: 'How often should your child do this chore?  Your child will be allowed to record this chore and be rewarded at the frequency you choose here.  For example, if you choose daily, your child will be able to record the chore once each day.  Twice daily will allow the chore to be recorded once before noon and once after noon each day.  After your child completes a "One time only" chore, they will not be able to record it again until you assign it to them again.',
            showCloseButton: true,
            duration: 30000,
            closeButtonText: 'Ok'
        });
        toast.present();
    }

    private selectAll() {
        this.kidChecks.forEach(kidCheck => {
            kidCheck.checked = true;
        });
    }


}
