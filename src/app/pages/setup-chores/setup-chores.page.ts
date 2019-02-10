import {Component} from '@angular/core';
import {Kid, KidService} from '../../services/kid/kid.service';
import {Chore, ChoreService, Frequency} from '../../services/chore/chore.service';
import {EventsService, EventTopic} from '../../services/events/events.service';
import {IonItemSliding, NavController} from '@ionic/angular';

export class ChoreGroup {
    groupName: string;
    chores: Chore[];
    isOpen: boolean;

    constructor(name: string, chores: Chore[], isOpen: boolean) {
        this.groupName = name;
        this.chores = chores;
        this.isOpen = isOpen;
    }
}

export class ChoreAssignedToKids {
    chore: Chore;
    kids: Kid[];
    kidsNames: string;
    frequency: Frequency;
}

@Component({
    selector: 'app-setup-chores',
    templateUrl: './setup-chores.page.html',
    styleUrls: ['./setup-chores.page.scss'],
})
export class SetupChoresPage {

    chores: Chore[];
    choresAssignedToKids: ChoreAssignedToKids[];
    choreGroups: ChoreGroup[] = [];

    constructor(private kidService: KidService,
                private choreService: ChoreService,
                private eventsService: EventsService,
                private navController: NavController) {
        eventsService.subscribe(EventTopic.ChoreListChanged, () => {
            this.refresh();
        });
        eventsService.subscribe(EventTopic.AssignmentChanged, () => {
            this.refresh();
        });
        eventsService.subscribe(EventTopic.KidChanged, (kid: Kid) => {
            this.refresh();
        });
        this.refresh();
    }

    doToggleSection(group: ChoreGroup) {
        group.isOpen = !group.isOpen;
    }

    chooseChore(chore: Chore) {
        this.navController.navigateForward('/setup/tab/setup-chores/chores/' + chore.id);
    }

    unassign(assignment: ChoreAssignedToKids) {
        const item = <IonItemSliding><any>document.getElementById(assignment.chore.id);
        if (item) {
            item.close();
        }

        assignment.kids.forEach(kid => {
            this.choreService.unassignChore(assignment.chore.id, kid.id);
        });
    }

    private refresh() {
        this.choreService.listChores().then(choreList => {
            this.updateChores(choreList);
        });
        this.updateAssignments();
        if (this.kidService.listKids().length <= 0) {
            this.navigateToKids();
        }
    }

    private navigateToKids() {
        this.navController.navigateBack('/setup/tab/setup-kids');
    }

    private updateAssignments() {
        this.choresAssignedToKids = [];
        this.choreService.assignments.forEach((assignmentMap, choreId) => {
            const chore = this.choreService.getChore(choreId);
            let frequency = Frequency.Daily;
            const kids: Kid[] = [];
            let kidsNames = '';
            let delimiter = '';
            assignmentMap.forEach((choreAssignment, kidId) => {
                frequency = choreAssignment.frequency;
                const kid = this.kidService.getKid(kidId);
                if (kid) {
                    kidsNames = kidsNames + delimiter + kid.name;
                    delimiter = ', ';
                    kids.push(kid);
                }
            });
            const choreAssignedToKids: ChoreAssignedToKids = {
                chore: chore,
                kids: kids,
                kidsNames: kidsNames,
                frequency: frequency
            };
            this.choresAssignedToKids.push(choreAssignedToKids);
        });
    }

    private updateChores(choreList: Chore[]) {
        this.chores = choreList;
        const allChores = this.chores;
        const unassignedChores = allChores.filter(x => !this.hasAssignments(x));

        const simpleChores = this.sortChoreArray(this.fitsCategory(unassignedChores, 'Group'));
        const kitchenChores = this.sortChoreArray(this.fitsCategory(unassignedChores, 'Kitchen'));
        const householdChores = this.sortChoreArray(this.fitsCategory(unassignedChores, 'Rooms'));
        const bedroomChores = this.sortChoreArray(this.fitsCategory(unassignedChores, 'Bedroom'));
        const outdoorChores = this.sortChoreArray(this.fitsCategory(unassignedChores, 'Yardwork'));
        const miscChores = this.sortChoreArray(this.fitsCategory(unassignedChores, 'Misc'));
        const talentChores = this.sortChoreArray(this.fitsCategory(unassignedChores, 'Talents'));

        this.choreGroups = [
            new ChoreGroup('Simple', simpleChores, true),
            new ChoreGroup('In the Kitchen', kitchenChores, false),
            new ChoreGroup('Bedroom and Bathroom', bedroomChores, false),
            new ChoreGroup('Around the House', householdChores, false),
            new ChoreGroup('Outdoors', outdoorChores, false),
            new ChoreGroup('Talents and Interests', talentChores, false),
            new ChoreGroup('Miscellaneous', miscChores, false)
        ];
    }

    private hasAssignments(chore: Chore): boolean {
        return this.choreService.listAssignmentsForChore(chore.id).length > 0;
    }

    private fitsCategory(choreArray: Chore[], categoryName: string) {
        return choreArray.filter(x => x.category === categoryName);
    }

    private sortChoreArray(choreArray: Chore[]) {
        const subSortedByName = choreArray.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            } else if (a.name > b.name) {
                return 1;
            } else {
                return 0;
            }
        });
        return subSortedByName.sort((a, b) => {
            if (a.sort < b.sort) {
                return -1;
            } else if (a.sort > b.sort) {
                return 1;
            } else {
                return 0;
            }
        });
    }

}
