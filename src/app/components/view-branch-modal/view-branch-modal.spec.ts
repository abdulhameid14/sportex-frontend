import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBranchModal } from './view-branch-modal';

describe('ViewBranchModal', () => {
  let component: ViewBranchModal;
  let fixture: ComponentFixture<ViewBranchModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewBranchModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewBranchModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
