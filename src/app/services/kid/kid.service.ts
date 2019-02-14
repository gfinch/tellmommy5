import {Injectable} from '@angular/core';
import {Transaction, TransactionAction, TransactionService, TransactionType} from '../transaction/transaction.service';
import {EventsService, EventTopic} from '../events/events.service';
import {UUID} from '../../utilities/uuid/uuid';
import {AccountService} from '../account/account.service';
import {RewardSystemService} from '../reward-system/reward-system.service';

export class Kid {
    id: string;
    name: string;
    avatar: string;
    deleted: boolean;
    lastUpdated: number;
}

@Injectable({
    providedIn: 'root'
})
export class KidService {

    kids: Map<string, Kid>;
    lastUpdated = -1;
    initialized = false;

    constructor(private transactionService: TransactionService,
                private eventsService: EventsService,
                private accountService: AccountService,
                private rewardSystemService: RewardSystemService) {
        console.log('Instantiating KidService');
        this.kids = new Map<string, Kid>();
        this.eventsService.subscribe(EventTopic.KidTransaction, (transactions: Transaction[]) => {
            transactions.forEach(transaction => {
                this.handleKidTransactionEvent(transaction);
            });
            this.initialized = true;
        });

        this.eventsService.subscribe(EventTopic.RewardSystemChanged, () => {
            this.createDefaultAccounts();
        });

        this.eventsService.subscribe(EventTopic.ClearAll, () => {
            this.kids.clear();
        });

        this.refreshFromService();
    }

    listKids(): Kid[] {
        return Array.from(this.kids.values());
    }

    getKid(kidId: string): Kid {
        return this.kids.get(kidId);
    }

    createKid(name: string, avatar: string): string {
        const id = UUID.random();
        const kid: Kid = {
            id: id,
            name: name,
            avatar: avatar,
            deleted: false,
            lastUpdated: -1
        };

        this.logTransaction(kid, TransactionAction.Create);
        return id;
    }

    updateKid(id: string, name: string, avatar: string) {
        const existingKid = this.kids.get(id);
        existingKid.name = name;
        existingKid.avatar = avatar;

        this.logTransaction(existingKid, TransactionAction.Update);
    }

    updateKidAvatar(id: string, avatar: string) {
        const existingKid = this.kids.get(id);
        const name = existingKid.name;
        this.updateKid(id, name, avatar);
    }

    deleteKid(id: string) {
        const existingKid = this.kids.get(id);
        existingKid.deleted = true;

        this.logTransaction(existingKid, TransactionAction.Delete);
    }

    private logTransaction(kid: Kid, action: TransactionAction) {
        this.transactionService
            .logTransaction(TransactionType.Kid, action, kid.id, kid, true)
            .catch(err => {
                console.log('Unable to create or update kid: ' + JSON.stringify(kid) + ' because ' + err);
            });
    }

    private refreshFromService() {
        this.transactionService
            .replayTransactionsSince(TransactionType.Kid, this.lastUpdated)
            .catch(err => {
                console.log('Failed to replay transactionMap because ' + err);
            });
    }

    private createDefaultAccounts() {
        const rewardSystem = this.rewardSystemService.rewardSystem;
        this.kids.forEach(kid => {
            this.accountService.createDefaultAccounts(kid.id, rewardSystem);
        });
    }

    private handleKidTransactionEvent(transaction: Transaction) {
        const entityId = transaction.entityId;
        const timestamp = transaction.transactionTimestamp;
        const existingKid = this.kids.get(entityId);
        if (transaction.transactionTimestamp > this.lastUpdated) {
            this.lastUpdated = transaction.transactionTimestamp;
        }
        if (!existingKid || timestamp > existingKid.lastUpdated) {
            const newKid = transaction.entity as Kid;
            newKid.lastUpdated = transaction.transactionTimestamp;
            if (newKid.deleted) {
                this.kids.delete(entityId);
            } else {
                this.kids.set(entityId, newKid);
            }
            this.createDefaultAccounts();
            this.eventsService.publish(EventTopic.KidChanged, newKid);
        } else {
            console.log('Ignoring kid transaction because the timestamp of the transaction (' + transaction.transactionTimestamp
                + ') is older or equal to the current timestamp (' + existingKid.lastUpdated + ').');
        }
    }
}
