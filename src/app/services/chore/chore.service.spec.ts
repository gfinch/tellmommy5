import { TestBed } from '@angular/core/testing';

import { ChoreService } from './chore.service';

describe('ChoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChoreService = TestBed.get(ChoreService);
    expect(service).toBeTruthy();
  });
});
