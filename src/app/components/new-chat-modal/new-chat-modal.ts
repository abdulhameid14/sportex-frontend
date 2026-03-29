import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-new-chat-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './new-chat-modal.html',
  styleUrls: ['./new-chat-modal.scss', '../../../styles.scss'],
})
export class NewChatModal {
  @Input() isOpen = false;
  @Input() users: any[] = [];
  @Output() save = new EventEmitter<string>(); // userId
  @Output() closed = new EventEmitter<void>();

  selectedUser: any;

  submit() {
    if (this.selectedUser) {
      console.log('Saving new chat with user:', this.selectedUser);

      // Emit the full user object
      this.save.emit(this.selectedUser);
      this.selectedUser = null;
    }
  }



  close() {
    this.closed.emit();
  }
}
