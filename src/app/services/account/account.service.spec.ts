import 'reflect-metadata';
import {Account, AccountService} from './account.service';
import {EventsServiceMock} from '../events/events.service.mock';
import {TransactionService} from '../transaction/transaction.service';
import {AmplifyServiceMock} from '../amplify/amplify.service.mock';
import {StorageServiceMock} from '../storage/storage.service.mock';
import {RewardSystem} from '../reward-system/reward-system.service';

describe('AccountService', () => {
    let accountService: AccountService;
    let storageService: StorageServiceMock;

    beforeEach(() => {
        const amplifyService = new AmplifyServiceMock();
        storageService = new StorageServiceMock();
        const eventsService = new EventsServiceMock();
        const transactionService = new TransactionService(amplifyService, storageService, eventsService);
        accountService = new AccountService(eventsService, transactionService);
    });

});

function createAccount(id: string, split: number, accountService: AccountService): Account {
    const account = {
        rewardSystem: RewardSystem.Money,
        kidId: 'A',
        accountId: id,
        name: id,
        split: split,
        lastUpdated: -1,
        deleted: false
    };

    accountService.createAccountForKid(RewardSystem.Money, id, id, split);
    return account;
}
