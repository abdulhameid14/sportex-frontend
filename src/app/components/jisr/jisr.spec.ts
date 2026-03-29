import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Jisr } from './jisr';

describe('Jisr', () => {
  let component: Jisr;
  let fixture: ComponentFixture<Jisr>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Jisr]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Jisr);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
