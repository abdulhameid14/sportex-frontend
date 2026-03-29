import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IMeeting } from '../../interfaces/IMeeting';

@Component({
  selector: 'app-view-meeting-modal',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, TranslateModule],
  templateUrl: './view-meeting-modal.html',
  styleUrls: ['./view-meeting-modal.scss', '../../../styles.scss']
})
export class ViewMeetingModal {
  meeting = signal<IMeeting | null>(null);
  @Output() update = new EventEmitter<IMeeting>();
  @Output() closed = new EventEmitter<void>();
  isOpen = signal(false);

  open(meeting: IMeeting) {
    this.meeting.set({ ...meeting });
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
    this.closed.emit();
  }

  get attachments(): string[] {
    return this.meeting()?.attachments?.split(/,(?=\/uploads\/center\/)/) ?? [];
  }

  getMeetingStatus(): 'approved' | 'rejected' | 'pending' {
    const participants = this.meeting()?.participants || [];
    if (participants.length === 0) return 'pending';
    const approve = participants.filter(p => p.vote === 'approve' || p.vote === 'accepted' || p.vote === 'yes').length;
    const reject  = participants.filter(p => p.vote === 'reject').length;
    if (approve > reject) return 'approved';
    if (reject > approve) return 'rejected';
    return 'pending';
  }

  getCommentsCount(): number {
    return this.meeting()?.participants ? this.meeting()!.participants.filter(p => !!p.comment).length : 0;
  }
}
