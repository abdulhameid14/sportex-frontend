import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagenationButton } from './pagenation-button';

describe('PagenationButton', () => {
  let component: PagenationButton;
  let fixture: ComponentFixture<PagenationButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagenationButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagenationButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
