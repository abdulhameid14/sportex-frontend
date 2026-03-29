import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Strategy } from './strategy';

describe('Strategy', () => {
  let component: Strategy;
  let fixture: ComponentFixture<Strategy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Strategy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Strategy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
