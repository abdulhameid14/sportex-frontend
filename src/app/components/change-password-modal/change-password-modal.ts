import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './change-password-modal.html',
  styleUrl: './change-password-modal.scss'
})
export class ChangePasswordModal {
  isOpen = signal(false);
  @Output() confirm = new EventEmitter<boolean>();

  open() {
    this.isOpen.set(true);
  }

  close(result: boolean) {
    this.isOpen.set(false);
    this.confirm.emit(result);
  }
}
