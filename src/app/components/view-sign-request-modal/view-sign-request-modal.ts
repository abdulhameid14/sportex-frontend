import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IRequest } from '../../interfaces/IRequest.js';

@Component({
  selector: 'app-view-sign-request-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './view-sign-request-modal.html',
  styleUrls: ['./view-sign-request-modal.scss', '../../../styles.scss']
})
export class ViewSignRequestModal {
  request = signal<IRequest | null>(null);
  @Output() update = new EventEmitter<IRequest>();
  @Output() closed = new EventEmitter<void>();
  isOpen = signal(false);
  currentAttachments = signal<string[]>([]);

  constructor() {}

  open(request: IRequest) {
    console.log('Opening request modal for request:', request);
    this.request.set({ ...request });
    this.currentAttachments.set(this.attachments);
    this.isOpen.set(true);
  }

  // Separate methods to split attachment and document string to array of strings
  get attachments(): string[] {
    return this.request()?.attachments ? this.request()!.attachments!.split(/,(?=\/uploads\/center\/)/) : [];
  }

  close() {
    this.isOpen.set(false);
    this.closed.emit();
  }
}
