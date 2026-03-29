import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDepartmentModal } from './view-department-modal';

describe('ViewDepartmentModal', () => {
  let component: ViewDepartmentModal;
  let fixture: ComponentFixture<ViewDepartmentModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDepartmentModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDepartmentModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
