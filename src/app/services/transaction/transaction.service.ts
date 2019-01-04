import {Injectable} from '@angular/core';
import {StorageService} from '../storage/storage.service';
import {AmplifyService} from '../amplify/amplify.service';
import {EventsService, EventTopic} from '../events/events.service';

export enum TransactionType {
    RewardSystem = 'RewardSystem',
    Kid = 'Kid'
}

export enum TransactionStructure {
    Immutable = 0,
    Mutable = 1
}

export class Transaction {
    transactionType: TransactionType;
    transactionTimestamp: number;
    entityId: string;
    entity: object;

    constructor(transactionType: TransactionType, transactionTimestamp: number,
                entityId: string, entity: object) {
        this.transactionType = transactionType;
        this.transactionTimestamp = transactionTimestamp;
        this.entityId = entityId;
        this.entity = entity;
    }
}

@Injectable({
    providedIn: 'root'
})
export class TransactionService {

    transactionMap: Map<TransactionType, Map<string, Transaction> | Transaction[]> = null;
    transactionsAreInitialized = false;
    transactionStructureMap: Map<TransactionType, TransactionStructure> = new Map([
        [TransactionType.RewardSystem, TransactionStructure.Mutable],
        [TransactionType.Kid, TransactionStructure.Mutable]
    ]);
    transactionTopicMap: Map<TransactionType, EventTopic> = new Map([
        [TransactionType.RewardSystem, EventTopic.RewardSystemTransaction],
        [TransactionType.Kid, EventTopic.KidTransaction]
    ]);

    constructor(private amplifyService: AmplifyService,
                private storageService: StorageService,
                private eventsService: EventsService) {
        console.log('Instantiating TransactionService');
        this.transactionMap = new Map<TransactionType, Map<string, Transaction> | Transaction[]>();
        eventsService.subscribe(EventTopic.ClearAll, (transaction: Transaction) => {
            this.transactionMap.clear();
        });
    }


    logTransaction(transactionType: TransactionType, entityId: string, entity: object): Promise<Transaction> {
        return new Promise<Transaction>((resolve, reject) => {
            this.initializeTransactions().then(() => {
                const timestamp = Date.now().valueOf();
                const transaction = new Transaction(
                    transactionType, timestamp, entityId, entity
                );

                this.appendTransaction(transactionType, transaction).then(() => {
                    this.publishTransactionEvent(transactionType, transaction);
                    resolve(transaction);
                }).catch(err => {
                    reject(err);
                });
            });
        });
    }

    replayTransactionsSince(transactionType: TransactionType, lastTransactionTimestamp: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            console.log('Attempting to replay transactions: ' + transactionType + ' since ' + lastTransactionTimestamp);
            this.retrieveTransactionsSince(transactionType, lastTransactionTimestamp).then(transactions => {
                console.log('Found ' + transactions.length + ' transactions for ' + transactionType);
                transactions.forEach(transaction => {
                    this.publishTransactionEvent(transactionType, transaction);
                });
            });
        });
    }

    private publishTransactionEvent(transactionType: TransactionType, transaction: Transaction) {
        const topic = this.transactionTopicMap.get(transactionType);
        this.eventsService.publish(topic, transaction);
    }

    private retrieveTransactionsSince(transactionType: TransactionType, lastTransactionTimestamp: number): Promise<Transaction[]> {
        return new Promise<Transaction[]>((resolve, reject) => {
            this.initializeTransactions().then(() => {
                this.retrieveAllTransactions(transactionType).then(transactions => {
                    let transactionArray: Transaction[] = null;
                    if (this.transactionStructureMap.get(transactionType) == TransactionStructure.Mutable) {
                        transactionArray = Array.from((transactions as Map<string, Transaction>).values());
                    } else {
                        transactionArray = (transactions as Transaction[]);
                    }

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

    private retrieveAllTransactions(transactionType: TransactionType): Promise<Map<string, Transaction> | Transaction[]> {
        return new Promise<Map<string, Transaction> | Transaction[]>((resolve, reject) => {
            if (this.transactionMap.get(transactionType)) {
                resolve(this.transactionMap.get(transactionType));
            } else {
                const storageKey = this.buildStorageKey(transactionType);
                console.log('Attempting to get ' + storageKey);
                this.storageService.get(storageKey)
                    .then(transactions => {
                        if (transactions) {
                            this.transactionMap.set(transactionType, transactions);
                            resolve(transactions);
                        } else {
                            let emptyTransactions: Map<string, Transaction> | Transaction[];
                            if (this.transactionStructureMap.get(transactionType) === TransactionStructure.Mutable) {
                                emptyTransactions = new Map<string, Transaction>();
                            } else {
                                emptyTransactions = [];
                            }
                            this.storageService.set(storageKey, emptyTransactions);
                            resolve(emptyTransactions);
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
                if (this.transactionStructureMap.get(transactionType) === TransactionStructure.Mutable) {
                    const mutableEntityMap = transactions as Map<string, Transaction>;
                    const currentTransaction = mutableEntityMap.get(transaction.entityId);
                    if (!currentTransaction || currentTransaction.transactionTimestamp <= transaction.transactionTimestamp) {
                        mutableEntityMap.set(transaction.entityId, transaction);
                    } else {
                        console.log('Failed to update ' + transaction.entityId + ' with a timestamp earlier than stored entity.');
                    }
                } else {
                    (transactions as Transaction[]).push(transaction);
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
