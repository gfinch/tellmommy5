import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ForgotPassPage} from './forgot-pass.page';
import {RouterModule} from '@angular/router';
import {AlertController, LoadingController} from '@ionic/angular';
import {AmplifyService} from '../../services/amplify/amplify.service';
import {AmplifyServiceMock} from '../../services/amplify/amplify.service.mock';
import {StorageService} from '../../services/storage/storage.service';
import {StorageServiceMock} from '../../services/storage/storage.service.mock';
import {EventsService} from '../../services/events/events.service';
import {EventsServiceMock} from '../../services/events/events.service.mock';

describe('ForgotPassPage', () => {
    let component: ForgotPassPage;
    let fixture: ComponentFixture<ForgotPassPage>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ForgotPassPage],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [
                RouterModule.forRoot([])
            ],
            providers: [
                LoadingController,
                AlertController,
                {provide: AmplifyService, useClass: AmplifyServiceMock},
                {provide: StorageService, useClass: StorageServiceMock},
                {provide: EventsService, useClass: EventsServiceMock}
            ]
        }).compileComponents();
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
