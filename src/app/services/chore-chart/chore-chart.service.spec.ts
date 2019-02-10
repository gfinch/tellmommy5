import {TestBed} from '@angular/core/testing';

import {ChoreChartService} from './chore-chart.service';
import {AmplifyService} from '../amplify/amplify.service';
import {AmplifyServiceMock} from '../amplify/amplify.service.mock';
import {StorageService} from '../storage/storage.service';
import {StorageServiceMock} from '../storage/storage.service.mock';
import {EventsService} from '../events/events.service';
import {EventsServiceMock} from '../events/events.service.mock';

describe('ChoreChartService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            {provide: AmplifyService, useClass: AmplifyServiceMock},
            {provide: StorageService, useClass: StorageServiceMock},
            {provide: EventsService, useClass: EventsServiceMock},
        ]
    }));

    it('should be created', () => {
        const service: ChoreChartService = TestBed.get(ChoreChartService);
        expect(service).toBeTruthy();
    });
});
