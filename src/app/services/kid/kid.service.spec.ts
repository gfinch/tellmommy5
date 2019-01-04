import {TestBed} from '@angular/core/testing';

import {KidService} from './kid.service';
import {TestBedFactory} from '../../utilities/tests/TestBedFactory';

describe('KidService', () => {
    beforeEach(() => TestBedFactory.configure());

    it('should be created', () => {
        const service: KidService = TestBed.get(KidService);
        expect(service).toBeTruthy();
    });
});
