import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskSubmitModal } from './task-submit-modal';

describe('TaskSubmitModal', () => {
  let component: TaskSubmitModal;
  let fixture: ComponentFixture<TaskSubmitModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskSubmitModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskSubmitModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
