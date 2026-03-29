import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewReportModal } from './new-report-modal';

describe('NewReportModal', () => {
  let component: NewReportModal;
  let fixture: ComponentFixture<NewReportModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewReportModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewReportModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
