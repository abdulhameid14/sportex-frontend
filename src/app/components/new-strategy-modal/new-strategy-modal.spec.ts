import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewStrategyModal } from './new-strategy-modal';

describe('NewStrategyModal', () => {
  let component: NewStrategyModal;
  let fixture: ComponentFixture<NewStrategyModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewStrategyModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewStrategyModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
