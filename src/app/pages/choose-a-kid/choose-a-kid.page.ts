import {Component} from '@angular/core';
import {Kid, KidService} from '../../services/kid/kid.service';
import {EventsService, EventTopic} from '../../services/events/events.service';
import {NavController} from '@ionic/angular';

@Component({
    selector: 'app-choose-a-kid',
    templateUrl: './choose-a-kid.page.html',
    styleUrls: ['./choose-a-kid.page.scss'],
})
export class ChooseAKidPage {

    kids: Array<Kid> = [];

    constructor(private navController: NavController,
                private kidService: KidService,
                private eventService: EventsService) {
        this.refresh();
        this.eventService.subscribe(EventTopic.KidChanged, () => {
            this.refresh();
        });
        this.eventService.subscribe(EventTopic.DoAssignment, () => {
            this.refresh();
        });
    }

    refresh() {
        this.kids = this.kidService.listKids();
    }

    getRemainingChoreCount(kid: Kid) {
        return 0;
    }

    goToKidPage(kid: Kid) {
        this.navController.navigateForward('/view-edit-kids-chores/' + kid.id);
    }

}
