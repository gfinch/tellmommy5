import {TestBed} from '@angular/core/testing';

import {Transaction, TransactionAction, TransactionService, TransactionType} from './transaction.service';
import {StorageServiceMock} from '../storage/storage.service.mock';
import {AmplifyServiceMock} from '../amplify/amplify.service.mock';
import {EventsServiceMock} from '../events/events.service.mock';
import {TestBedFactory} from '../../utilities/tests/TestBedFactory';

describe('TransactionService', () => {
    beforeEach(() => TestBedFactory.configure());

    it('should be created', () => {
        const service: TransactionService = TestBed.get(TransactionService);
        expect(service).toBeTruthy();
    });

    describe('retrieve transactions', () => {
        it('should get a value from a mutable entity map.', () => {
            const expected = new Transaction(TransactionType.RewardSystem, TransactionAction.Create, 10, '123', {'hello': 'world'});
            const map = new Map([['123', expected]]);
            const storageService = new StorageServiceMock(new Map([['Transaction_RewardSystem', map]]));
            const transactionService = new TransactionService(
                new AmplifyServiceMock(), storageService, new EventsServiceMock()
            );
            transactionService['retrieveTransactionsSince'](TransactionType.RewardSystem, 0).then(transactions => {
                const foundTransaction = transactions.find(tran => {
                    return tran.entityId === expected.entityId;
                });
                expect(foundTransaction === expected);
            });
        });
    });
});
