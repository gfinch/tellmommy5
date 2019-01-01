import {inject} from '@angular/core/testing';

import {AuthGuard} from './auth.guard';
import {TestBedFactory} from '../utilities/tests/TestBedFactory';

describe('AuthGuard', () => {
    beforeEach(() => {
        TestBedFactory.configure();
    });

    it('should ...', inject([AuthGuard], (guard: AuthGuard) => {
        expect(guard).toBeTruthy();
    }));
});
