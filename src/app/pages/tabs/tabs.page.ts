import {Component} from '@angular/core';
import {KidService} from '../../services/kid/kid.service';
import {EventsService, EventTopic} from '../../services/events/events.service';

@Component({
    templateUrl: './tabs.page.html'
})
export class TabsPage {
    choresDisabled = false;

    constructor(private kidService: KidService,
                private eventService: EventsService) {
        this.eventService.subscribe(EventTopic.KidChanged, () => {
            this.refreshTabs();
        });
        this.refreshTabs();
    }

    private refreshTabs() {
        this.choresDisabled = this.kidService.listKids().length <= 0;
    }
}
