import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewReportModal } from './view-report-modal';

describe('ViewReportModal', () => {
  let component: ViewReportModal;
  let fixture: ComponentFixture<ViewReportModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewReportModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewReportModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
