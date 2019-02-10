import { TestBed } from '@angular/core/testing';

import { ChoreKeyService } from './chore-key.service';

describe('ChoreKeyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChoreKeyService = TestBed.get(ChoreKeyService);
    expect(service).toBeTruthy();
  });
});
