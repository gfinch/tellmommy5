import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ForgotPassPage} from './forgot-pass.page';
import {TestBedFactory} from '../../utilities/tests/TestBedFactory';

describe('ForgotPassPage', () => {
    let component: ForgotPassPage;
    let fixture: ComponentFixture<ForgotPassPage>;

    beforeEach(async(() => {
        TestBedFactory.configure([ForgotPassPage]);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ForgotPassPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
