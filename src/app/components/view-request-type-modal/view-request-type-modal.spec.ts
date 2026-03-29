import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRequestTypeModal } from './view-request-type-modal';

describe('ViewRequestTypeModal', () => {
  let component: ViewRequestTypeModal;
  let fixture: ComponentFixture<ViewRequestTypeModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRequestTypeModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewRequestTypeModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
