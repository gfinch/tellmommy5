import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {LoginPage} from './login.page';
import {TestBedFactory} from '../../utilities/tests/TestBedFactory';

describe('LoginPage', () => {
    let component: LoginPage;
    let fixture: ComponentFixture<LoginPage>;

    beforeEach(async(() => {
        TestBedFactory.configure([LoginPage]);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
