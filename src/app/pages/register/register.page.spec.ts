import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {RegisterPage} from './register.page';
import {AmplifyService} from '../../services/amplify/amplify.service';
import {StorageService} from '../../services/storage/storage.service';
import {EventsService} from '../../services/events/events.service';
import {EventsServiceMock} from '../../services/events/events.service.mock';
import {StorageServiceMock} from '../../services/storage/storage.service.mock';
import {AmplifyServiceMock} from '../../services/amplify/amplify.service.mock';
import {RouterModule} from '@angular/router';
import {AlertController, LoadingController} from '@ionic/angular';

describe('RegisterPage', () => {
    let component: RegisterPage;
    let fixture: ComponentFixture<RegisterPage>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RegisterPage],
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
        fixture = TestBed.createComponent(RegisterPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
