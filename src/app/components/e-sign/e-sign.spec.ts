import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ESign } from './e-sign';

describe('ESign', () => {
  let component: ESign;
  let fixture: ComponentFixture<ESign>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ESign]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ESign);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
