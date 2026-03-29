import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-delete-validation-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './delete-validation-modal.html',
  styleUrl: './delete-validation-modal.scss'
})
export class DeleteValidationModal {
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
