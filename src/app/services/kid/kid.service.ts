import {Injectable} from '@angular/core';
import {Transaction, TransactionService, TransactionType} from '../transaction/transaction.service';
import {EventsService, EventTopic} from '../events/events.service';
import {UUID} from '../../utilities/uuid/uuid';

export class Kid {
    id: string;
    name: string;
    avatar: string;
    lastUpdated: number;
}

@Injectable({
    providedIn: 'root'
})
export class KidService {

    kids: Map<string, Kid>;
    lastUpdated = -1;

    constructor(private transactionService: TransactionService,
                private eventsService: EventsService) {
        console.log('Instantiating KidService');
        this.kids = new Map<string, Kid>();
        eventsService.subscribe(EventTopic.KidTransaction, (transaction: Transaction) => {
            this.handleKidTransactionEvent(transaction);
        });
        eventsService.subscribe(EventTopic.ClearAll, () => {
            this.kids.clear();
        });
        this.refreshFromService();
    }

    listKids(): Kid[] {
        return Array.from(this.kids.values());
    }

    createKid(name: string, avatar: string) {
        const id = UUID.random();
        const kid: Kid = {
            id: id,
            name: name,
            avatar: avatar,
            lastUpdated: -1
        };

        this.logTransaction(kid);
    }

    updateKid(id: string, name: string, avatar: string) {
        const existingKid = this.kids.get(id);
        existingKid.name = name;
        existingKid.avatar = avatar;

        this.logTransaction(existingKid);
    }

    private logTransaction(kid: Kid) {
        this.transactionService
            .logTransaction(TransactionType.Kid, kid.id, kid)
            .catch(err => {
                console.log('Unable to create or update kid: ' + JSON.stringify(kid) + ' because ' + err);
            });
    }

    private refreshFromService() {
        this.transactionService
            .replayTransactionsSince(TransactionType.Kid, this.lastUpdated)
            .catch(err => {
                console.log('Failed to replay transactions because ' + err);
            });
    }

    private handleKidTransactionEvent(transaction: Transaction) {
        const entityId = transaction.entityId;
        const timestamp = transaction.transactionTimestamp;
        const existingKid = this.kids.get(entityId);
        if (!existingKid || timestamp > existingKid.lastUpdated) {
            const newKid = transaction.entity as Kid;
            newKid.lastUpdated = transaction.transactionTimestamp;
            this.kids.set(entityId, newKid);
            this.eventsService.publish(EventTopic.KidChanged, newKid);
        } else {
            console.log('Ignoring kid transaction because the timestamp of the transaction (' + transaction.transactionTimestamp
                + ') is older or equal to the current timestamp (' + existingKid.lastUpdated + ').');
        }
    }
}
