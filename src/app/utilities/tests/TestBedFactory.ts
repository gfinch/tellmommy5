import {TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {RouterModule} from '@angular/router';
import {AlertController, LoadingController, NavController, Platform} from '@ionic/angular';
import {APP_BASE_HREF, Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {AuthService} from '../../services/auth/auth.service';
import {AmplifyService} from '../../services/amplify/amplify.service';
import {AmplifyServiceMock} from '../../services/amplify/amplify.service.mock';
import {StorageService} from '../../services/storage/storage.service';
import {StorageServiceMock} from '../../services/storage/storage.service.mock';
import {EventsService} from '../../services/events/events.service';
import {EventsServiceMock} from '../../services/events/events.service.mock';

export class TestBedFactory {
    static configure(declarations?: any[]) {

        return TestBed.configureTestingModule({
            declarations: declarations,
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [
                RouterModule.forRoot([])
            ],
            providers: [
                Platform,
                {provide: LocationStrategy, useClass: PathLocationStrategy},
                {provide: APP_BASE_HREF, useValue: '/'},
                Location,
                NavController,
                LoadingController,
                AlertController,
                AuthService,
                {provide: AmplifyService, useClass: AmplifyServiceMock},
                {provide: StorageService, useClass: StorageServiceMock},
                {provide: EventsService, useClass: EventsServiceMock}
            ]
        }).compileComponents();
    }
}
