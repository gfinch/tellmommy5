import {Injectable} from '@angular/core';
import {Events} from '@ionic/angular';
import {EventHandler} from '@ionic/angular/dist/providers/events';

export enum EventTopic {
    ClearAll = 'ClearAll',
    RewardSystemTransaction = 'RewardSystemTransaction',
    RewardSystemChanged = 'RewardSystemChanged',
    KidTransaction = 'KidTransaction',
    KidChanged = 'KidChanged'
}

export abstract class EventsService {
    abstract subscribe(topic: EventTopic, handler: EventHandler): void;

    abstract publish(topic: EventTopic, ...args: any[]): any[] | null;
}

@Injectable({
    providedIn: 'root'
})
export class EventsServiceIonic extends EventsService {

    constructor(private events: Events) {
        super();
    }

    subscribe(topic: EventTopic, handler: EventHandler): void {
        return this.events.subscribe(topic, this.repackage(topic, handler));
    }

    publish(topic: EventTopic, ...args: any[]): any[] | null {
        const head = args[0];
        console.log('Sent at ' + topic + ': ' + JSON.stringify(head));
        return this.events.publish(topic, args);
    }

    private repackage(topic: EventTopic, handler: EventHandler) {
        return (args: any[]) => {
            const head = args[0];
            console.log('Received at ' + topic + ': ' + JSON.stringify(head));
            handler(head);
        };
    }
}
