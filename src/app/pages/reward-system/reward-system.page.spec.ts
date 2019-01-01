import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {RewardSystemPage} from './reward-system.page';
import {TestBedFactory} from '../../utilities/tests/TestBedFactory';

describe('RewardSystemPage', () => {
    let component: RewardSystemPage;
    let fixture: ComponentFixture<RewardSystemPage>;

    beforeEach(async(() => {
        TestBedFactory.configure([RewardSystemPage]);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RewardSystemPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
