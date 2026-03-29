import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSignRequestModal } from './view-sign-request-modal';

describe('ViewSignRequestModal', () => {
  let component: ViewSignRequestModal;
  let fixture: ComponentFixture<ViewSignRequestModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSignRequestModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewSignRequestModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
