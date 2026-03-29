import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTaskModal } from './new-task-modal';

describe('NewTaskModal', () => {
  let component: NewTaskModal;
  let fixture: ComponentFixture<NewTaskModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewTaskModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewTaskModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
