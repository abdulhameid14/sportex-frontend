import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTransactionModal } from './view-transaction-modal';

describe('ViewTransactionModal', () => {
  let component: ViewTransactionModal;
  let fixture: ComponentFixture<ViewTransactionModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTransactionModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewTransactionModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
