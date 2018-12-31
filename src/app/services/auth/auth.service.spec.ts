import 'reflect-metadata';
import {AmplifyServiceMock} from '../amplify/amplify.service.mock';
import {AuthService} from './auth.service';
import {StorageServiceMock} from '../storage/storage.service.mock';

describe('User', () => {
    it('sets a familyId in storage', () => {
        const mockedAmplifyService = new AmplifyServiceMock();
        const mockedStorageService = new StorageServiceMock(new Map<string, any>());
        const expected = 'some-family-id';

        const test = new AuthService(mockedAmplifyService, mockedStorageService);
        return test['setFamilyId'](expected).then(familyId => {
            expect(familyId).toBe(expected);
        });
    });

    it('gets a familyId from storage', () => {
        const mockedAmplifyService = new AmplifyServiceMock();
        const expected = 'some-family-id';
        const mockedStorageService = new StorageServiceMock(new Map([['familyId', expected]]));

        const test = new AuthService(mockedAmplifyService, mockedStorageService);
        return test['getFamilyId']().then(familyId => {
            expect(familyId).toBe(expected);
        });
    });

    it('creates a new familyId and sets it in storage', () => {
        const mockedAmplifyService = new AmplifyServiceMock();
        const mockedStorageService = new StorageServiceMock(new Map());

        const test = new AuthService(mockedAmplifyService, mockedStorageService);
        return test['getFamilyId']().then(familyId => {
            expect(familyId.length).toBe(36);
        });
    });

    it('finds a family id from cognito', () => {
        const mockedAmplifyService = new AmplifyServiceMock();
        const expected = 'some-family-id';
        const mockedStorageService = new StorageServiceMock(new Map());

        const test = new AuthService(mockedAmplifyService, mockedStorageService);
        return test['getFamilyIdFromCognito']().then(familyId => {
            expect(familyId).toBe(expected);
        });
    });

});
