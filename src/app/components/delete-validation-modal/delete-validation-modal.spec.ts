import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteValidationModal } from './delete-validation-modal';

describe('DeleteValidationModal', () => {
  let component: DeleteValidationModal;
  let fixture: ComponentFixture<DeleteValidationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteValidationModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteValidationModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
