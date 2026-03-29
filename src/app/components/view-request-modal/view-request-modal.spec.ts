import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRequestModal } from './view-request-modal';

describe('ViewRequestModal', () => {
  let component: ViewRequestModal;
  let fixture: ComponentFixture<ViewRequestModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRequestModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewRequestModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
