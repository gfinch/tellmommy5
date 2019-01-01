import {inject} from '@angular/core/testing';

import {SetupGuard} from './setup.guard';
import {TestBedFactory} from '../utilities/tests/TestBedFactory';

describe('SetupGuard', () => {
    beforeEach(() => {
        TestBedFactory.configure();
    });

    it('should ...', inject([SetupGuard], (guard: SetupGuard) => {
        expect(guard).toBeTruthy();
    }));
});
