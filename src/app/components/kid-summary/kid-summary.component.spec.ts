import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KidSummaryComponent } from './kid-summary.component';

describe('KidSummaryComponent', () => {
  let component: KidSummaryComponent;
  let fixture: ComponentFixture<KidSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KidSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KidSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
