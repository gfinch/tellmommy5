import {Injectable} from '@angular/core';
import {Account, AccountService} from '../account/account.service';
import {Transaction, TransactionAction, TransactionService, TransactionType} from '../transaction/transaction.service';
import {RewardSystem} from '../reward-system/reward-system.service';
import {UUID} from '../../utilities/uuid/uuid';
import {EventsService, EventTopic} from '../events/events.service';
import {Kid} from '../kid/kid.service';

export class AccountTransaction {
    id: string;
    accountId: string;
    assignmentTransactionId: string;
    memo: string;
    value: number;
    timestamp: number;
    deleted: boolean;
}

export class DisplayableAccount {
    account: Account;
    accountTotal: string;
}

@Injectable({
    providedIn: 'root'
})
export class BankService {

    // RewardSystem --> KidId --> AccountId --> TransactionId --> Transaction
    transactionMap: Map<RewardSystem, Map<string, Map<string, Map<string, AccountTransaction>>>> = new Map();
    pendingTransactions: Map<string, AccountTransaction[]> = new Map();
    initialized = false;

    constructor(private accountService: AccountService,
                private transactionService: TransactionService,
                private eventService: EventsService) {

        this.eventService.subscribe(EventTopic.DepositTransaction, (transactions: Transaction[]) => {
            this.handleDeposits(transactions);
            this.initialized = true;
        });

        this.eventService.subscribe(EventTopic.AccountsChanged, () => {
            this.handleAccountChanges();
        });

        this.eventService.subscribe(EventTopic.KidChanged, (kid: Kid) => {
            if (kid.deleted) {
                this.handleKidDeleted(kid);
            }
        });

        this.eventService.subscribe(EventTopic.ClearAll, () => {
            this.transactionMap = new Map();
            this.pendingTransactions = new Map();
        });

        this.transactionService.replayTransactionsSince(TransactionType.Deposit, -1);
    }

    depositToAllAccounts(rewardSystem: RewardSystem, kidId: string, value: number, assignmentTransactionId: string, memo: string) {
        const accounts = this.accountService.listAccountsForKid(rewardSystem, kidId);
        const accountValueMap = this.splitValueAcrossAccounts(accounts, value);

        const transactions: AccountTransaction[] = Array.from(accountValueMap, ([accountId, accountValue]) => {
            return {
                id: UUID.random(),
                accountId: accountId,
                assignmentTransactionId: assignmentTransactionId,
                memo: memo,
                value: accountValue,
                timestamp: new Date().getTime(),
                deleted: false
            };
        });

        this.logTransactions(transactions, TransactionAction.Upsert);
    }

    depositToOneAccount(rewardSystem: RewardSystem, kidId: string, accountId: string, value: number, memo: string) {
        const transaction = {
            id: UUID.random(),
            accountId: accountId,
            assignmentTransactionId: null,
            memo: memo,
            value: value,
            timestamp: new Date().getTime(),
            deleted: false
        };

        this.logTransactions([transaction], TransactionAction.Upsert);
    }

    cancelDeposit(rewardSystem: RewardSystem, kidId: string, accountId: string, transactionid: string) {
        const transaction = this.retrieveTransactionForTransactionId(rewardSystem, kidId, accountId, transactionid);
        if (transaction) {
            transaction.deleted = true;
            transaction.timestamp = new Date().getTime();
            this.logTransactions([transaction], TransactionAction.Delete);
        }
    }

    cancelAssignmentTransactions(rewardSystem: RewardSystem, kidId: string, assignmentTransactionId: string) {
        const transactionsForKid = this.retrieveTransactionsForKid(rewardSystem, kidId);
        const toBeCancelled = transactionsForKid.filter(transaction => {
            return transaction.assignmentTransactionId === assignmentTransactionId;
        });

        const cancelledTransactions = toBeCancelled.map(transaction => {
            transaction.deleted = true;
            transaction.timestamp = new Date().getTime();
            return transaction;
        });

        this.logTransactions(cancelledTransactions, TransactionAction.Delete);
    }

    accountTotals(rewardSystem: RewardSystem, kidId: string): DisplayableAccount[] {
        const accountsForKid = this.accountService.listAccountsForKid(rewardSystem, kidId);
        return accountsForKid.map(account => {
            const transactionsForAccount = this.retrieveTransactionsForAccount(rewardSystem, kidId, account.accountId);
            const total = transactionsForAccount.reduce((r, c) => {
                return r + c.value;
            }, 0);
            const accountTotal = total.toString();
            return {
                account: account,
                accountTotal: accountTotal
            };
        });
    }

    accountTotal(rewardSystem: RewardSystem, kidId: string, accountId: string): DisplayableAccount {
        const totals = this.accountTotals(rewardSystem, kidId);
        return totals.find(total => total.account.accountId === accountId);
    }

    accountTransactions(rewardSystem: RewardSystem, kidId: string, accountId: string): AccountTransaction[] {
        const accountTransactions = this.retrieveTransactionsForAccount(rewardSystem, kidId, accountId);
        accountTransactions.sort((a, b) => {
            return a.timestamp - b.timestamp;
        });
        return accountTransactions;
    }

    private logTransactions(transactions: AccountTransaction[], action: TransactionAction) {
        const transactionGroup = UUID.random();
        const promises = transactions.map(transaction => {
            return this.transactionService.logTransaction(TransactionType.Deposit, action, transaction.id,
                transaction, false, transactionGroup);
        });
        Promise.all(promises).then(() => {
            this.transactionService.commitTransactions(TransactionType.Deposit, transactionGroup);
        });
    }

    private splitValueAcrossAccounts(accounts: Account[], value: number): Map<string, number> {
        const result = new Map<string, number>();

        const nonZeroAccounts = accounts.filter(account => {
            return account.split > 0;
        });

        if (nonZeroAccounts.length > 0) {
            const [head, ...tail] = nonZeroAccounts;
            tail.forEach(account => {
                const computedValue = (account.split / 100) * value;
                result.set(account.accountId, computedValue);
            });
            const sumOfResult = Array.from(result.values()).reduce((a, b) => a + b, 0);
            result.set(head.accountId, value - sumOfResult);
        }
        return result;
    }

    private handleDeposits(transactions: Transaction[]) {
        transactions.forEach(transaction => {
            const accountTransaction = transaction.entity as AccountTransaction;
            this.handleAccountTransaction(accountTransaction);
        });
        this.eventService.publish(EventTopic.Deposit);
    }

    private handleAccountTransaction(accountTransaction: AccountTransaction) {
        const account = this.accountService.getAccountById(accountTransaction.accountId);
        if (account) {
            const accountsForRewardSystem = this.transactionMap.get(account.rewardSystem as RewardSystem) || new Map();
            const accountsForKid = accountsForRewardSystem.get(account.kidId) || new Map();
            const accountTransactions = accountsForKid.get(account.accountId) || new Map();
            if (accountTransaction.deleted) {
                accountTransactions.delete(accountTransaction.id);
            } else {
                accountTransactions.set(accountTransaction.id, accountTransaction);
            }
            accountsForKid.set(account.accountId, accountTransactions);
            accountsForRewardSystem.set(account.kidId, accountsForKid);
            this.transactionMap.set(account.rewardSystem as RewardSystem, accountsForRewardSystem);
        } else {
            const pendingTransactions = this.pendingTransactions.get(accountTransaction.accountId) || [];
            pendingTransactions.push(accountTransaction);
            this.pendingTransactions.set(accountTransaction.accountId, pendingTransactions);
        }
    }

    private handleAccountChanges() {
        Array.from(this.pendingTransactions.keys(), accountId => {
            if (this.accountService.getAccountById(accountId)) {
                const transactions = this.pendingTransactions.get(accountId);
                this.pendingTransactions.delete(accountId);
                transactions.forEach(accountTransaction => {
                    this.handleAccountTransaction(accountTransaction);
                });
            }
        });
    }

    private handleKidDeleted(kid: Kid) {
        Array.from(this.transactionMap.keys(), rewardSystem => {
            this.transactionMap.get(rewardSystem).delete(kid.id);
        });
    }

    private retrieveTransactionsForAccount(rewardSystem: RewardSystem, kidId: string, accountId: string): AccountTransaction[] {
        const rewardSystemMap = this.transactionMap.get(rewardSystem) || new Map();
        const kidsAccountsMap = rewardSystemMap.get(kidId) || new Map();
        const transactions = kidsAccountsMap.get(accountId);
        if (transactions) {
            return Array.from(transactions.values());
        } else {
            return [];
        }
    }

    private retrieveTransactionForTransactionId(rewardSystem: RewardSystem, kidId: string, accountId: string, transactionId: string): AccountTransaction {
        const rewardSystemMap = this.transactionMap.get(rewardSystem) || new Map();
        const kidsAccountsMap = rewardSystemMap.get(kidId) || new Map();
        const accountMap = kidsAccountsMap.get(accountId) || new Map();
        return accountMap.get(transactionId);
    }

    private retrieveTransactionsForKid(rewardSystem: RewardSystem, kidId: string): AccountTransaction[] {
        const rewardSystemMap = this.transactionMap.get(rewardSystem) || new Map();
        const kidsAccountsMap = rewardSystemMap.get(kidId) || new Map();
        const results: AccountTransaction[] = [];
        kidsAccountsMap.forEach(transactions => {
            transactions.forEach(transaction => {
                results.push(transaction);
            });
        });
        return results;
    }
}
