import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAnnouncementModal } from './new-announcement-modal';

describe('NewAnnouncementModal', () => {
  let component: NewAnnouncementModal;
  let fixture: ComponentFixture<NewAnnouncementModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewAnnouncementModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewAnnouncementModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
