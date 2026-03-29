import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRoleModal } from './new-role-modal';

describe('NewRoleModal', () => {
  let component: NewRoleModal;
  let fixture: ComponentFixture<NewRoleModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewRoleModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewRoleModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
