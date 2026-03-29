import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewChatModal } from './new-chat-modal';

describe('NewChatModal', () => {
  let component: NewChatModal;
  let fixture: ComponentFixture<NewChatModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewChatModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewChatModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
