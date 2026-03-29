import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRecruitmentModal } from './new-recruitment-modal';

describe('NewRecruitmentModal', () => {
  let component: NewRecruitmentModal;
  let fixture: ComponentFixture<NewRecruitmentModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewRecruitmentModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewRecruitmentModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
