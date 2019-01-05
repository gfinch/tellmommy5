import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupKidEditPage } from './setup-kid-edit.page';

describe('SetupKidEditPage', () => {
  let component: SetupKidEditPage;
  let fixture: ComponentFixture<SetupKidEditPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupKidEditPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupKidEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
