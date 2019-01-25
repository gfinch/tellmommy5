import {Injectable} from '@angular/core';
import {EventsService, EventTopic} from '../events/events.service';
import {Transaction, TransactionAction, TransactionService, TransactionType} from '../transaction/transaction.service';
import {Kid} from '../kid/kid.service';
import {UUID} from '../../utilities/uuid/uuid';
import {RewardSystem} from '../reward-system/reward-system.service';

export class Account {
    rewardSystem: string;
    kidId: string;
    accountId: string;
    name: string;
    split: number;
    lastUpdated: number;
    deleted: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class AccountService {
    // RewardSystem -> KidId -> AccountId -> Account
    defaultsMap: Map<string, Map<string, boolean>> = new Map();
    kidAccountMap: Map<string, Map<string, Map<string, Account>>>;
    accounts: Map<string, Account>;
    lastUpdated = -1;

    private defaultAccounts: Map<string, Map<string, number>> = new Map([
        [RewardSystem.Money, new Map([['Savings', 50], ['Fun Money', 40], ['Charity', 10]])],
        [RewardSystem.Time, new Map([['Screen Time', 50], ['Play Time', 50]])],
        [RewardSystem.Points, new Map([['Points', 100]])],
        [RewardSystem.None, new Map()]
    ]);

    // Need to figure out when to build default accounts ... when kid is created and when reward system is changed??
    constructor(private eventsService: EventsService,
                private transactionService: TransactionService) {
        console.log('Instantiating AccountService');
        this.kidAccountMap = new Map();
        this.accounts = new Map();
        this.eventsService.subscribe(EventTopic.AccountTransaction, (transactions: Transaction[]) => {
            this.handleAccountTransactionEvent(transactions);
        });
        this.eventsService.subscribe(EventTopic.KidChanged, (kid: Kid) => {
            if (kid.deleted) {
                this.deleteAccountsForKid(kid);
            }
        });
        this.eventsService.subscribe(EventTopic.ClearAll, () => {
            this.accounts.clear();
            this.kidAccountMap.clear();
        });
        this.refreshFromService();
    }

    createDefaultAccounts(kidId: string, rewardSystem: RewardSystem) {
        if (rewardSystem !== RewardSystem.None) {
            if (!this.defaultsMap.get(rewardSystem) || !this.defaultsMap.get(rewardSystem).get(kidId)) {
                const defaultMapForSystem = this.defaultsMap.get(rewardSystem) || new Map();
                defaultMapForSystem.set(kidId, true);
                this.defaultsMap.set(rewardSystem, defaultMapForSystem);

                if (!this.kidAccountMap.get(rewardSystem) || !this.kidAccountMap.get(rewardSystem).get(kidId)) {
                    const group = UUID.random();
                    const accounts = Array.from(this.defaultAccounts.get(rewardSystem).entries()).map(entry => {
                        const name = entry[0];
                        const split = entry[1];
                        const newAccount = this.buildAccountForKid(rewardSystem, kidId, name, split);
                        this.addAccountFromTransaction(newAccount, -1, newAccount.accountId);
                        return newAccount;
                    });

                    const promises = accounts.map(account => {
                        return this.logTransaction(account, TransactionAction.Create, false, group);
                    });

                    Promise.all(promises).then(() => {
                        return this.transactionService.commitTransactions(TransactionType.Account, group);
                    });
                }
            }
        }
    }

    createAccountForKid(rewardSystem: RewardSystem, kidId: string, name: string, split?: number) {
        const account = this.buildAccountForKid(rewardSystem, kidId, name, split);
        this.logTransaction(account, TransactionAction.Create, true);
    }

    updateAccount(account: Account) {
        this.updateAccountForKid(account.rewardSystem, account.kidId, account.accountId, account.name, account.split);
    }

    updateAccountForKid(rewardSystem: string, kidId: string, accountId: string, name: string, split: number) {
        const account = this.getAccountForKid(rewardSystem, kidId, accountId);
        account.name = name;
        account.split = split;
        this.logTransaction(account, TransactionAction.Update, true);
    }

    deleteAccountForKid(rewardSystem: string, kidId: string, accountId: string) {
        const account = this.getAccountForKid(rewardSystem, kidId, accountId);
        account.split = 0;
        account.deleted = true;
        this.logTransaction(account, TransactionAction.Delete, true);
    }

    listAccountsForKid(rewardSystem: RewardSystem, kidId: string): Account[] {
        const accounts = Array.from(this.getKidAccounts(rewardSystem, kidId).values()).sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        });

        return accounts;
    }

    private buildAccountForKid(rewardSystem: RewardSystem, kidId: string, name: string, split?: number): Account {
        const accountId = UUID.random();
        return {
            rewardSystem: rewardSystem,
            kidId: kidId,
            accountId: accountId,
            name: name,
            split: split ? split : 0,
            lastUpdated: -1,
            deleted: false
        };
    }

    private logTransaction(account: Account, action: TransactionAction, commit: boolean, group?: string) {
        this.transactionService
            .logTransaction(TransactionType.Account, action, account.accountId, account, commit, group)
            .catch(err => {
                console.log('Failed to log account transaction ' + err);
            });
    }

    private refreshFromService() {
        this.transactionService
            .replayTransactionsSince(TransactionType.Account, this.lastUpdated)
            .catch(err => {
                console.log('Failed to replay transactions because ' + err);
            });
    }

    private handleAccountTransactionEvent(transactions: Transaction[]) {
        transactions.forEach(transaction => {
            this.handleTransaction(transaction);
        });

        if (transactions.length > 0) {
            const firstAccount = transactions[0].entity as Account;
            this.levelSplits(firstAccount);
            this.eventsService.publish(EventTopic.AccountsChanged);
        }
    }

    private handleTransaction(transaction: Transaction) {
        const entityId = transaction.entityId;
        const timestamp = transaction.transactionTimestamp;
        const existingAccount = this.accounts.get(entityId);
        if (transaction.transactionTimestamp > this.lastUpdated) {
            this.lastUpdated = transaction.transactionTimestamp;
        }
        if (!existingAccount || timestamp > existingAccount.lastUpdated) {
            const newAccount = transaction.entity as Account;
            const lastUpdated = transaction.transactionTimestamp;
            this.addAccountFromTransaction(newAccount, lastUpdated, entityId);
        } else {
            console.log('Ignoring account transaction because the timestamp of the transaction (' + transaction.transactionTimestamp
                + ') is older or equal to the current timestamp (' + existingAccount.lastUpdated + ').');
        }
    }

    private addAccountFromTransaction(newAccount: Account, lastUpdated: number, entityId: string) {
        newAccount.lastUpdated = lastUpdated;
        const rewardSystem = newAccount.rewardSystem as RewardSystem;
        const kidId = newAccount.kidId;
        if (newAccount.deleted) {
            console.log('Deleting account ' + newAccount.name);
            this.accounts.delete(entityId);
            if (this.kidAccountMap.get(rewardSystem)) {
                if (this.kidAccountMap.get(rewardSystem).get(kidId)) {
                    this.kidAccountMap.get(rewardSystem).get(kidId).delete(entityId);
                }
                if (this.listAccountsForKid(rewardSystem, kidId).length === 0) {
                    this.kidAccountMap.get(rewardSystem).delete(kidId);
                }
            }
        } else {
            const rewardSystemAccounts = this.kidAccountMap.get(rewardSystem) || new Map();
            const kidAccounts = rewardSystemAccounts.get(kidId) || new Map();
            kidAccounts.set(entityId, newAccount);
            rewardSystemAccounts.set(kidId, kidAccounts);
            this.kidAccountMap.set(rewardSystem, rewardSystemAccounts);
            this.accounts.set(entityId, newAccount);
        }
    }

    private getRewardSystemAccounts(rewardSystem): Map<string, Map<string, Account>> {
        return this.kidAccountMap.get(rewardSystem) || new Map();
    }

    private getKidAccounts(rewardSystem: string, kidId: string): Map<string, Account> {
        return this.getRewardSystemAccounts(rewardSystem).get(kidId) || new Map();
    }

    private getAccountForKid(rewardSystem: string, kidId: string, accountId: string): Account {
        return this.getKidAccounts(rewardSystem, kidId).get(accountId);
    }

    private deleteAccountsForKid(kid: Kid) {
        [RewardSystem.Money, RewardSystem.Points, RewardSystem.Time].forEach(rewardSystem => {
            this.listAccountsForKid(rewardSystem, kid.id).forEach(account => {
                this.deleteAccountForKid(rewardSystem, kid.id, account.accountId);
            });
        });
    }

    private levelSplits(account: Account) {
        console.log('Starting level splits with account ' + account.name);
        const kidsAccounts = this.listAccountsForKid(account.rewardSystem as RewardSystem, account.kidId);
        if (kidsAccounts && kidsAccounts.length > 0) {
            if (kidsAccounts.length === 1) {
                console.log('Adjusting ' + account.name + ' to be 100.');
                kidsAccounts[0].split = 100;
            } else {
                const values = kidsAccounts.map(acc => {
                    return acc.split;
                });
                const sumTotal = values.reduce((a, b) => {
                    return a + b;
                }, 0);
                const adjustment = 100 - sumTotal;
                console.log('Computed adjustment: ' + adjustment);
                if (adjustment !== 0) {
                    this.adjust(account, kidsAccounts, adjustment);
                }
            }
        }
    }

    private adjust(account: Account, accounts: Account[], adjustment: number) {
        const index = accounts.indexOf(account);
        const nextIndex = index + 1 === accounts.length ? 0 : index + 1;
        const otherAccount = accounts[nextIndex];
        if (otherAccount.split + adjustment >= 0) {
            const newSplit = otherAccount.split + adjustment;
            console.log('Adjusting ' + otherAccount.name + ' to be ' + newSplit + '.');
            this.setSplit(otherAccount, newSplit);
        } else {
            console.log('Adjusting ' + otherAccount.name + ' to be 0.');
            this.setSplit(otherAccount, 0);
        }
    }

    private setSplit(account: Account, split: number) {
        this.updateAccountForKid(account.rewardSystem, account.kidId, account.accountId, account.name, split);
    }

}
