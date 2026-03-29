import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRequestModal } from './new-request-modal';

describe('NewRequestModal', () => {
  let component: NewRequestModal;
  let fixture: ComponentFixture<NewRequestModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewRequestModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewRequestModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
