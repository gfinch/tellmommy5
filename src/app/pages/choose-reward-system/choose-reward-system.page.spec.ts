import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ChooseRewardSystemPage} from './choose-reward-system.page';
import {TestBedFactory} from '../../utilities/tests/TestBedFactory';

describe('ChooseRewardSystemPage', () => {
    let component: ChooseRewardSystemPage;
    let fixture: ComponentFixture<ChooseRewardSystemPage>;

    TestBedFactory.configure([ChooseRewardSystemPage]);

    beforeEach(() => {
        fixture = TestBed.createComponent(ChooseRewardSystemPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
