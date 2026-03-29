import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddApplicationModal } from './add-application-modal';

describe('AddApplicationModal', () => {
  let component: AddApplicationModal;
  let fixture: ComponentFixture<AddApplicationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddApplicationModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddApplicationModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
