import {Injectable} from '@angular/core';
import {EventHandler} from '@ionic/angular/dist/providers/events';
import {EventsService} from './events.service';

@Injectable({
    providedIn: 'root'
})
export class EventsServiceMock extends EventsService {

    constructor() {
        super();
    }

    subscribe(topic: string, handler: EventHandler): void {
        return;
    }

    unsubscribe(topic: string, handler?: EventHandler): boolean {
        return true;
    }

    publish(topic: string, ...args: any[]): any[] | null {
        return null;
    }

}
