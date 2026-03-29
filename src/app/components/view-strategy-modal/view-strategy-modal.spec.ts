import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewStrategyModal } from './view-strategy-modal';

describe('ViewStrategyModal', () => {
  let component: ViewStrategyModal;
  let fixture: ComponentFixture<ViewStrategyModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewStrategyModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewStrategyModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
