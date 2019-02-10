import {Injectable} from '@angular/core';
import {Transaction, TransactionAction, TransactionService, TransactionType} from '../transaction/transaction.service';
import {EventsService, EventTopic} from '../events/events.service';

export enum RewardSystem {
    Money = 'Money',
    Time = 'Time',
    Points = 'Points',
    None = 'None'
}

@Injectable({
    providedIn: 'root'
})
export class RewardSystemService {

    rewardSystem: RewardSystem = RewardSystem.Money;
    lastUpdated = -1;

    entityId = 'RewardSystemEntityId';

    constructor(private transactionService: TransactionService,
                private eventsService: EventsService) {
        console.log('Instantiating RewardSystemService');
        eventsService.subscribe(EventTopic.RewardSystemTransaction, (transactions: Transaction[]) => {
            transactions.forEach(transaction => {
                this.handleRewardSystemTransactionEvent(transaction);
            });
        });
        eventsService.subscribe(EventTopic.ClearAll, () => {
            this.rewardSystem = RewardSystem.Money;
        });
        this.refreshFromService();
    }

    private refreshFromService() {
        this.transactionService
            .replayTransactionsSince(TransactionType.RewardSystem, this.lastUpdated)
            .catch(err => {
                console.log('Failed to replay transactionMap because ' + err);
            });
    }

    private handleRewardSystemTransactionEvent(transaction: Transaction) {
        if (transaction.transactionTimestamp > this.lastUpdated) {
            const oldRewardSystem = this.rewardSystem;
            this.rewardSystem = transaction.entity['rewardSystem'];
            this.lastUpdated = transaction.transactionTimestamp;

            if (oldRewardSystem !== this.rewardSystem) {
                this.eventsService.publish(EventTopic.RewardSystemChanged, this.rewardSystem);
            } else {
                console.log('Not publishing reward system event since the latest transaction did not change the reward system.');
            }
        } else {
            console.log('Ignoring reward system transaction because the timestamp of the transaction (' + transaction.transactionTimestamp
                + ') is older or equal to the current timestamp (' + this.lastUpdated + ').');
        }
    }

    updateRewardSystem(rewardSystem: RewardSystem) {
        this.transactionService
            .logTransaction(TransactionType.RewardSystem, TransactionAction.Upsert,
                this.entityId, {rewardSystem: rewardSystem}, true)
            .catch(err => {
                console.log('Failed to log transaction because ' + err);
            });
    }

}
