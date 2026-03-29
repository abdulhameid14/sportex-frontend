import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRoleModal } from './view-role-modal';

describe('ViewRoleModal', () => {
  let component: ViewRoleModal;
  let fixture: ComponentFixture<ViewRoleModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRoleModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewRoleModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
