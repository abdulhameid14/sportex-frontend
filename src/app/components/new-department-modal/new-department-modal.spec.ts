import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDepartmentModal } from './new-department-modal';

describe('NewDepartmentModal', () => {
  let component: NewDepartmentModal;
  let fixture: ComponentFixture<NewDepartmentModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewDepartmentModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewDepartmentModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
