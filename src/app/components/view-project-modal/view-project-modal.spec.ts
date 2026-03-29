import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProjectModal } from './view-project-modal';

describe('ViewProjectModal', () => {
  let component: ViewProjectModal;
  let fixture: ComponentFixture<ViewProjectModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewProjectModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewProjectModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
