import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRequestTypeModal } from './new-request-type-modal';

describe('NewRequestTypeModal', () => {
  let component: NewRequestTypeModal;
  let fixture: ComponentFixture<NewRequestTypeModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewRequestTypeModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewRequestTypeModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
