import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonTable } from './skeleton-table';

describe('SkeletonTable', () => {
  let component: SkeletonTable;
  let fixture: ComponentFixture<SkeletonTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkeletonTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
