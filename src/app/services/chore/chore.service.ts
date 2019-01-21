import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {plainToClass} from 'class-transformer';
import {EventsService, EventTopic} from '../events/events.service';

export class Chore {
    id: string;
    name: string;
    category: string;
    value: number;
    icon: string;
    author: string;
    sort: number;
}

@Injectable({
    providedIn: 'root'
})
export class ChoreService {

    choreList: Chore[] = [];

    constructor(private http: HttpClient, private eventsService: EventsService) {
        console.log('Instantiating Chore Service');
        this.eventsService.subscribe(EventTopic.ClearAll, () => {
            this.choreList = [];
        });
    }

    listChores(): Promise<Chore[]> {
        return new Promise((resolve, reject) => {
            if (this.choreList && this.choreList.length > 0) {
                resolve(this.choreList);
            } else {
                this.http.get<Chore[]>('assets/json/chores.json').subscribe(data => {
                    this.choreList = plainToClass(Chore, data);
                    this.eventsService.publish(EventTopic.ChoreListChanged, this.choreList);
                    resolve(this.choreList);
                }, error => reject(error));
            }
        });
    }

    getChore(choreId: string): Promise<Chore> {
        return this.listChores().then(chores => {
            return chores.find(chore => {
                return chore.id === choreId;
            });
        });
    }
}
