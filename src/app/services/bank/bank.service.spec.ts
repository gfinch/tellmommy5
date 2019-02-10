import {TestBed} from '@angular/core/testing';

import {BankService} from './bank.service';
import {Account} from '../account/account.service';
import {AmplifyService} from '../amplify/amplify.service';
import {StorageService} from '../storage/storage.service';
import {EventsService} from '../events/events.service';
import {AmplifyServiceMock} from '../amplify/amplify.service.mock';
import {StorageServiceMock} from '../storage/storage.service.mock';
import {EventsServiceMock} from '../events/events.service.mock';

describe('BankService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            {provide: AmplifyService, useClass: AmplifyServiceMock},
            {provide: StorageService, useClass: StorageServiceMock},
            {provide: EventsService, useClass: EventsServiceMock},
        ]
    }));

    it('should be created', () => {
        const service: BankService = TestBed.get(BankService);
        expect(service).toBeTruthy();
    });

    it('should split values with one account', () => {
        const service: BankService = TestBed.get(BankService);
        const account1 = makeAccount('1', 100);

        const result = service['splitValueAcrossAccounts']([account1], 100);
        expect(result.get('1')).toBe(100);
    });

    it('should split values with two uneven accounts', () => {
        const service: BankService = TestBed.get(BankService);
        const account1 = makeAccount('1', 20);
        const account2 = makeAccount('2', 80);

        const result = service['splitValueAcrossAccounts']([account1, account2], 100);
        expect(result.get('1')).toBe(20);
        expect(result.get('2')).toBe(80);
    });

    it('should split values with three accounts', () => {
        const service: BankService = TestBed.get(BankService);
        const account1 = makeAccount('1', 33);
        const account2 = makeAccount('2', 33);
        const account3 = makeAccount('3', 34);

        const result = service['splitValueAcrossAccounts']([account1, account2, account3], 100);
        expect(result.get('1')).toBe(33);
        expect(result.get('2')).toBe(33);
        expect(result.get('3')).toBe(34);
    });

    it('should handle no accounts gracefully', () => {
        const service: BankService = TestBed.get(BankService);

        const result = service['splitValueAcrossAccounts']([], 100);
        expect(result.size).toBe(0);
    });

    it('should discard accounts with zero split', () => {
        const service: BankService = TestBed.get(BankService);
        const account1 = makeAccount('1', 22);
        const account2 = makeAccount('2', 0);
        const account3 = makeAccount('3', 0);
        const account4 = makeAccount('4', 78);

        const result = service['splitValueAcrossAccounts']([account1, account2, account3, account4], 100);
        expect(result.get('1')).toBe(22);
        expect(result.get('2')).toBeFalsy();
        expect(result.get('3')).toBeFalsy();
        expect(result.get('4')).toBe(78);
    });
});

function makeAccount(id: string, split: number): Account {
    return {
        rewardSystem: 'money',
        kidId: id,
        accountId: id,
        name: id,
        split: split,
        lastUpdated: -1,
        deleted: false
    };
}
