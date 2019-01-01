import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {RegisterPage} from './register.page';
import {TestBedFactory} from '../../utilities/tests/TestBedFactory';

describe('RegisterPage', () => {
    let component: RegisterPage;
    let fixture: ComponentFixture<RegisterPage>;

    beforeEach(async(() => {
        TestBedFactory.configure([RegisterPage]);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RegisterPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
