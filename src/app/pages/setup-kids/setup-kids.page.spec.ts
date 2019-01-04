import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupKidsPage } from './setup-kids.page';

describe('SetupKidsPage', () => {
  let component: SetupKidsPage;
  let fixture: ComponentFixture<SetupKidsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupKidsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupKidsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
