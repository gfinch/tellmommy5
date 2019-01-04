import {TestBed} from '@angular/core/testing';

import {RewardSystemService} from './reward-system.service';
import {TestBedFactory} from '../../utilities/tests/TestBedFactory';

describe('RewardSystemService', () => {
    beforeEach(() => TestBedFactory.configure());

    it('should be created', () => {
        const service: RewardSystemService = TestBed.get(RewardSystemService);
        expect(service).toBeTruthy();
    });
});
