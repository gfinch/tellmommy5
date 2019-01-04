import {Injectable} from '@angular/core';
import {EventHandler} from '@ionic/angular/dist/providers/events';
import {EventsService, EventTopic} from './events.service';

@Injectable({
    providedIn: 'root'
})
export class EventsServiceMock extends EventsService {

    constructor() {
        super();
    }

    subscribe(topic: EventTopic, handler: EventHandler): void {
        return;
    }

    publish(topic: EventTopic, ...args: any[]): any[] | null {
        return null;
    }

}
