import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEmployeeModal } from './view-employee-modal';

describe('ViewEmployeeModal', () => {
  let component: ViewEmployeeModal;
  let fixture: ComponentFixture<ViewEmployeeModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEmployeeModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewEmployeeModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
