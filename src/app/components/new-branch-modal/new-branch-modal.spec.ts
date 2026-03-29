import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBranchModal } from './new-branch-modal';

describe('NewBranchModal', () => {
  let component: NewBranchModal;
  let fixture: ComponentFixture<NewBranchModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewBranchModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewBranchModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
