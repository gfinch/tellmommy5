import {Injectable} from '@angular/core';
import {Events} from '@ionic/angular';
import {EventHandler} from '@ionic/angular/dist/providers/events';

export abstract class EventsService {
    abstract subscribe(topic: string, handler: EventHandler): void;

    abstract unsubscribe(topic: string, handler?: EventHandler): boolean;

    abstract publish(topic: string, ...args: any[]): any[] | null;
}

@Injectable({
    providedIn: 'root'
})
export class EventsServiceIonic extends EventsService {

    constructor(private events: Events) {
        super();
    }

    subscribe(topic: string, handler: EventHandler): void {
        return this.events.subscribe(topic, handler);
    }

    unsubscribe(topic: string, handler?: EventHandler): boolean {
        return this.events.unsubscribe(topic, handler);
    }

    publish(topic: string, ...args: any[]): any[] | null {
        return this.events.publish(topic, args);
    }

}
