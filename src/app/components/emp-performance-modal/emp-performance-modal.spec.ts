import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpPerformanceModal } from './emp-performance-modal';

describe('EmpPerformanceModal', () => {
  let component: EmpPerformanceModal;
  let fixture: ComponentFixture<EmpPerformanceModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpPerformanceModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpPerformanceModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
