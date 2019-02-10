import {Injectable} from '@angular/core';
import {StorageService} from '../storage/storage.service';
import {AmplifyService} from '../amplify/amplify.service';
import {EventsService, EventTopic} from '../events/events.service';
import {UUID} from '../../utilities/uuid/uuid';

export enum TransactionType {
    RewardSystem = 'RewardSystem',
    Kid = 'Kid',
    Account = 'Account',
    Assignment = 'Assignment',
    DoAssignment = 'DoAssignment',
    Deposit = 'Deposit'
}

export enum TransactionAction {
    Create = 'Create',
    Update = 'Update',
    Delete = 'Delete',
    Upsert = 'Upsert'
}

export class Transaction {
    transactionType: TransactionType;
    transactionAction: TransactionAction;
    transactionTimestamp: number;
    entityId: string;
    entity: object;
    group: string;

    constructor(transactionType: TransactionType, transactionAction: TransactionAction,
                transactionTimestamp: number, entityId: string, entity: object, group: string) {
        this.transactionType = transactionType;
        this.transactionAction = transactionAction;
        this.transactionTimestamp = transactionTimestamp;
        this.entityId = entityId;
        this.entity = entity;
        this.group = group;
    }
}

@Injectable({
    providedIn: 'root'
})
export class TransactionService {

    pendingTransactions: Map<string, Transaction[]> = new Map<string, Transaction[]>();
    transactionMap: Map<TransactionType, Map<string, Transaction>> = null;
    transactionsAreInitialized = false;
    transactionTopicMap: Map<TransactionType, EventTopic> = new Map([
        [TransactionType.RewardSystem, EventTopic.RewardSystemTransaction],
        [TransactionType.Kid, EventTopic.KidTransaction],
        [TransactionType.Account, EventTopic.AccountTransaction],
        [TransactionType.Assignment, EventTopic.AssignmentTransaction],
        [TransactionType.DoAssignment, EventTopic.DoAssignmentTransaction],
        [TransactionType.Deposit, EventTopic.DepositTransaction]
    ]);

    constructor(private amplifyService: AmplifyService,
                private storageService: StorageService,
                private eventsService: EventsService) {
        console.log('Instantiating TransactionService');
        this.transactionMap = new Map<TransactionType, Map<string, Transaction>>();
        eventsService.subscribe(EventTopic.ClearAll, (transaction: Transaction) => {
            this.transactionMap.clear();
        });
    }

    logTransaction(transactionType: TransactionType, transactionAction: TransactionAction,
                   entityId: string, entity: object, autocommit?: boolean, group?: string): Promise<Transaction> {
        if (!group) {
            group = UUID.random();
        }
        return new Promise<Transaction>((resolve) => {
            this.initializeTransactions().then(() => {
                const timestamp = Date.now().valueOf();
                const transaction = new Transaction(
                    transactionType, transactionAction, timestamp, entityId, entity, group
                );

                this.addPendingTransaction(transaction);
                if (autocommit) {
                    this.commitTransactions(transactionType, group).then(() => resolve(transaction));
                } else {
                    resolve(transaction);
                }
            });
        });
    }

    commitTransactions(transactionType: TransactionType, group: string): Promise<Transaction[]> {
        const transactions = this.pendingTransactions.get(group);
        if (transactions) {
            console.log('Committing ' + transactions.length + ' from group ' + group);
            const promises = transactions.map(transaction => {
                return this.appendTransaction(transaction.transactionType, transaction);
            });
            return Promise.all(promises).then(() => {
                this.publishTransactionEvent(transactionType, transactions);
                return transactions;
            });
        } else {
            console.log('Committing 0 from group ' + group);
            return Promise.resolve([]);
        }
    }

    replayTransactionsSince(transactionType: TransactionType, lastTransactionTimestamp: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            console.log('Attempting to replay transactionMap: ' + transactionType + ' since ' + lastTransactionTimestamp);
            this.retrieveTransactionsSince(transactionType, lastTransactionTimestamp).then(transactions => {
                console.log('Found ' + transactions.length + ' transactionMap for ' + transactionType);
                this.publishTransactionEvent(transactionType, transactions);
            });
        });
    }

    private addPendingTransaction(transaction: Transaction) {
        let existingTransactions: Transaction[];
        if (this.pendingTransactions.get(transaction.group)) {
            existingTransactions = this.pendingTransactions.get(transaction.group);
        } else {
            existingTransactions = [];
        }

        existingTransactions.push(transaction);
        console.log(transaction.group + ' has length ' + existingTransactions.length);
        this.pendingTransactions.set(transaction.group, existingTransactions);
    }

    private publishTransactionEvent(transactionType: TransactionType, transactions: Transaction[]) {
        const topic = this.transactionTopicMap.get(transactionType);
        this.eventsService.publish(topic, transactions);
    }

    private retrieveTransactionsSince(transactionType: TransactionType, lastTransactionTimestamp: number): Promise<Transaction[]> {
        return new Promise<Transaction[]>((resolve, reject) => {
            this.initializeTransactions().then(() => {
                this.retrieveAllTransactions(transactionType).then(transactions => {
                    const transactionArray = Array.from((transactions as Map<string, Transaction>).values());
                    const filtered = transactionArray.filter(transaction => {
                        return transaction.transactionTimestamp > lastTransactionTimestamp;
                    });

                    resolve(filtered);
                }).catch(err => reject(err));
            });
        });
    }

    private initializeTransactions(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.transactionsAreInitialized) {
                resolve();
            } else {
                const allPromises = Object.keys(TransactionType).map(transactionType => {
                    return this.retrieveAllTransactions(TransactionType[transactionType]);
                });
                Promise.all(allPromises).then(() => {
                    this.transactionsAreInitialized = true;
                    resolve();
                }).catch(err => {
                    reject(err);
                });
            }
        });
    }

    private retrieveAllTransactions(transactionType: TransactionType): Promise<Map<string, Transaction>> {
        return new Promise<Map<string, Transaction>>((resolve, reject) => {
            if (this.transactionMap.get(transactionType)) {
                resolve(this.transactionMap.get(transactionType));
            } else {
                const storageKey = this.buildStorageKey(transactionType);
                console.log('Attempting to get ' + storageKey);
                this.storageService.get(storageKey)
                    .then(transactions => {
                        if (transactions) {
                            console.log('Found existing transactionMap for ' + storageKey);
                            this.transactionMap.set(transactionType, transactions);
                            resolve(transactions);
                        } else {
                            console.log('Creating a new map for ' + storageKey);
                            const emptyTransactions = new Map<string, Transaction>();

                            this.storageService.set(storageKey, emptyTransactions).then(() => {
                                this.transactionMap.set(transactionType, emptyTransactions);
                                resolve(emptyTransactions);
                            });
                        }
                    }).catch(err => {
                    reject(err);
                });
            }
        });
    }

    private appendTransaction(transactionType: TransactionType, transaction: Transaction): Promise<Map<string, Transaction> | Transaction[]> {
        console.log('Appending transaction: ' + JSON.stringify(transaction));
        return new Promise<Map<string, Transaction> | Transaction[]>((resolve, reject) => {
            this.retrieveAllTransactions(transactionType).then(transactions => {
                const mutableEntityMap = transactions as Map<string, Transaction>;
                console.log('Trying to get transaction for ' + transaction.entityId);
                const currentTransaction = mutableEntityMap.get(transaction.entityId);
                if (!currentTransaction || currentTransaction.transactionTimestamp <= transaction.transactionTimestamp) {
                    mutableEntityMap.set(transaction.entityId, transaction);
                } else {
                    console.log('Failed to update ' + transaction.entityId + ' with a timestamp earlier than stored entity.');
                }
                this.transactionMap.set(transactionType, transactions);
                const storageKey = this.buildStorageKey(transactionType);
                this.storageService.set(storageKey, transactions).then(() => {
                    resolve(transactions);
                }).catch(err => reject(err));
            }).catch(err => reject(err));
        });
    }

    private buildStorageKey(transactionType: TransactionType): string {
        return 'Transaction_' + transactionType;
    }
}
