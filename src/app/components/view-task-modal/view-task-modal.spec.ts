import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTaskModal } from './view-task-modal';

describe('ViewTaskModal', () => {
  let component: ViewTaskModal;
  let fixture: ComponentFixture<ViewTaskModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTaskModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewTaskModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
