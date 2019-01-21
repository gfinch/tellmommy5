import {Component} from '@angular/core';
import {Kid, KidService} from '../../services/kid/kid.service';
import {Chore, ChoreService} from '../../services/chore/chore.service';
import {EventsService, EventTopic} from '../../services/events/events.service';

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

@Component({
    selector: 'app-setup-chores',
    templateUrl: './setup-chores.page.html',
    styleUrls: ['./setup-chores.page.scss'],
})
export class SetupChoresPage {

    kids: Map<string, Kid> = new Map();
    chores: Chore[];
    choreGroups: ChoreGroup[] = [];

    constructor(private kidService: KidService,
                private choreService: ChoreService,
                private eventsService: EventsService) {
        eventsService.subscribe(EventTopic.ChoreListChanged, (choreList: Chore[]) => {
            this.updateChores(choreList);
        });
        eventsService.subscribe(EventTopic.KidChanged, (kid: Kid) => {
            this.kids.set(kid.id, kid);
        });
        this.initialize();
    }

    doToggleSection(group: ChoreGroup) {
        group.isOpen = !group.isOpen;
    }

    chooseChore(chore: Chore) {
        console.log('Chore chosen: ' + chore.name);
    }

    private initialize() {
        this.kidService.listKids().forEach(kid => {
            this.kids.set(kid.id, kid);
        });
        this.choreService.listChores().then(choreList => {
            this.updateChores(choreList);
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
        return false;
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
