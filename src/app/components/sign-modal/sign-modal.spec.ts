import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignModal } from './sign-modal';

describe('SignModal', () => {
  let component: SignModal;
  let fixture: ComponentFixture<SignModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
