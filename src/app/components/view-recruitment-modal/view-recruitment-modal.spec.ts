import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRecruitmentModal } from './view-recruitment-modal';

describe('ViewRecruitmentModal', () => {
  let component: ViewRecruitmentModal;
  let fixture: ComponentFixture<ViewRecruitmentModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRecruitmentModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewRecruitmentModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
