import 'reflect-metadata';
import {AmplifyServiceMock} from '../amplify/amplify.service.mock';
import {AuthService} from './auth.service';
import {StorageServiceMock} from '../storage/storage.service.mock';
import {EventsServiceMock} from '../events/events.service.mock';

describe('User', () => {
    it('sets a familyId in storage', () => {
        const mockedAmplifyService = new AmplifyServiceMock();
        const mockedStorageService = new StorageServiceMock(new Map<string, any>());
        const mockedEventService = new EventsServiceMock();
        const expected = 'some-family-id';

        const test = new AuthService(mockedAmplifyService, mockedStorageService, mockedEventService);
        return test['setFamilyId'](expected).then(familyId => {
            expect(familyId).toBe(expected);
        });
    });

    it('gets a familyId from storage', () => {
        const mockedAmplifyService = new AmplifyServiceMock();
        const expected = 'some-family-id';
        const mockedStorageService = new StorageServiceMock(new Map([['familyId', expected]]));
        const mockedEventService = new EventsServiceMock();

        const test = new AuthService(mockedAmplifyService, mockedStorageService, mockedEventService);
        return test['getFamilyId']().then(familyId => {
            expect(familyId).toBe(expected);
        });
    });

    it('creates a new familyId and sets it in storage', () => {
        const mockedAmplifyService = new AmplifyServiceMock();
        const mockedStorageService = new StorageServiceMock(new Map());
        const mockedEventService = new EventsServiceMock();

        const test = new AuthService(mockedAmplifyService, mockedStorageService, mockedEventService);
        return test['getFamilyId']().then(familyId => {
            expect(familyId.length).toBe(36);
        });
    });

    it('finds a family id from cognito', () => {
        const mockedAmplifyService = new AmplifyServiceMock();
        const expected = 'some-family-id';
        const mockedStorageService = new StorageServiceMock(new Map());
        const mockedEventService = new EventsServiceMock();

        const test = new AuthService(mockedAmplifyService, mockedStorageService, mockedEventService);
        return test['getFamilyIdFromCognito']().then(familyId => {
            expect(familyId).toBe(expected);
        });
    });

});
