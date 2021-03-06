import {TestBed} from '@angular/core/testing';

import {ChoreService} from './chore.service';
import {AmplifyService} from '../amplify/amplify.service';
import {AmplifyServiceMock} from '../amplify/amplify.service.mock';
import {StorageService} from '../storage/storage.service';
import {StorageServiceMock} from '../storage/storage.service.mock';
import {EventsService} from '../events/events.service';
import {EventsServiceMock} from '../events/events.service.mock';
import {HttpClientModule} from '@angular/common/http';

describe('ChoreService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        imports: [HttpClientModule],
        providers: [
            {provide: AmplifyService, useClass: AmplifyServiceMock},
            {provide: StorageService, useClass: StorageServiceMock},
            {provide: EventsService, useClass: EventsServiceMock},
        ]
    }));

    it('should be created', () => {
        const service: ChoreService = TestBed.get(ChoreService);
        expect(service).toBeTruthy();
    });
});
