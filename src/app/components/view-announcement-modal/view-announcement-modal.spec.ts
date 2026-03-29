import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAnnouncementModal } from './view-announcement-modal';

describe('ViewAnnouncementModal', () => {
  let component: ViewAnnouncementModal;
  let fixture: ComponentFixture<ViewAnnouncementModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAnnouncementModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAnnouncementModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
