import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, UpperCasePipe } from '@angular/common';
import { NgClass } from '@angular/common';

import { Meeting } from '../../services/meeting';
import { IMeeting } from '../../interfaces/IMeeting';


// ngx-translate
import { TranslateModule } from '@ngx-translate/core';
import { HasPermissionDirective } from '../../directives/has-permission';
import { ViewMeetingModal } from '../view-meeting-modal/view-meeting-modal';

@Component({
  selector: 'app-meetings',
  standalone: true,
  templateUrl: './meeting.html',
  styleUrls: ['./meeting.scss', '../../../styles.scss'],
  imports: [
    CommonModule,
    NgClass,
    DatePipe,
    UpperCasePipe,
    TranslateModule,
    HasPermissionDirective,
    ViewMeetingModal,
  ]
})
export class MeetingsComponent implements OnInit {

  meetings: IMeeting[] = [];
  @ViewChild(ViewMeetingModal) viewModal!: ViewMeetingModal;

  // Fallback sample meetings used when API call fails (e.g., missing auth token)
  private SAMPLE_MEETINGS: IMeeting[] = [
    {
      id: '1c1c8634-ab98-4c66-aaf3-bab2bb0ac653',
      tenantId: '0d1c877c-8c89-4540-b728-c327cbf0439c',
      title: 'new new',
      participants: [{ vote: 'string', userId: 'f5b36554-2f88-42da-b76e-244b286fc248', comment: 'string' }],
      deadline: '2026-02-03T19:48:49.997Z',
      createdById: '',
      departmentId: '11c4aa1d-ef84-489e-922f-3aebef32a7e9',
      attachments: 'string',
      createdAt: '2026-02-03T19:51:41.031Z',
      updatedAt: '2026-02-03T19:51:41.031Z',
      deletedAt: null
    },
    {
      id: '64793bd0-e466-4572-a771-21225564bf06',
      tenantId: 'center',
      title: 'sand',
      participants: [
        { vote: '', userId: '177f2fab-8779-4c66-896f-46cf09fbf13c', comment: '' },
        { vote: 'accepted', userId: 'f5b36554-2f88-42da-b76e-244b286fc248', comment: 'fflddk' }
      ],
      deadline: '2026-02-19T15:24:00.000Z',
      createdById: '',
      departmentId: '',
      attachments: '',
      createdAt: '2026-02-03T21:25:33.365Z',
      updatedAt: '2026-02-03T21:56:02.549Z',
      deletedAt: null
    }
  ];

  currentPage = 1;
  searchTerm = '';
  tenantId!: string;
  loading = false;

  constructor(private meetingService: Meeting, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log("test");

    this.tenantId = localStorage.getItem('tenantId') || '';
    this.loadMeetings();
  }

  loadMeetings() {
    this.loading = true;

    // If developer mock data is present in localStorage, use it first for quick testing

    try {
      this.meetingService
        .getMeetings(this.currentPage, this.tenantId, this.searchTerm)
        .subscribe({
          next: (res) => {
            console.log('Meetings response:', res);

            this.meetings = res;
            this.loading = false;
            // Ensure UI updates
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.warn('Error fetching meetings:', err);
            // fallback to sample
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
    } catch (err) {
      // Synchronous errors (for example when token is missing and getHeaders throws)
      console.warn('Synchronous error while fetching meetings:', err);
      this.loading = false;
      this.cdr.detectChanges();
    }
  }



  // Developer helper: write SAMPLE_MEETINGS to localStorage and reload the list
  loadSampleMeetings() {
    localStorage.setItem('mockMeetings', JSON.stringify(this.SAMPLE_MEETINGS));
    this.meetings = this.SAMPLE_MEETINGS.slice();
    this.cdr.detectChanges();
    console.info('Sample meetings saved to localStorage.mockMeetings and applied');
  }

  onSearch(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.currentPage = 1;
    this.loadMeetings();
  }

  openViewMeetingModal(meeting: IMeeting) {
    this.viewModal.open(meeting);
  }

  updateMeeting(meeting: any) {
    if (!meeting || !meeting.id) return;
    this.meetingService.updateMeeting(meeting.id, meeting).subscribe({
      next: () => this.loadMeetings(),
      error: () => {}
    });
  }

  /* ================= VOTES ================= */

  getMeetingStatus(meeting: IMeeting): 'approved' | 'rejected' | 'pending' {
    const participants = meeting.participants || [];
    if (participants.length === 0) return 'pending';

    const approve = participants.filter(p => p.vote === 'approve').length;
    const reject  = participants.filter(p => p.vote === 'reject').length;

    if (approve > reject) return 'approved';
    if (reject > approve) return 'rejected';
    return 'pending';
  }

  getVotePercentage(meeting: IMeeting): number {
    const total = meeting.participants?.length || 0;
    if (total === 0) return 0;

    const voted = meeting.participants.filter(p => p.vote).length;
    return Math.round((voted / total) * 100);
  }

  getComments(meeting: IMeeting): string {
    return meeting.participants
      .filter(p => p.comment)
      .map(p => `• ${p.comment}`)
      .join('\n');
  }

  getCommentsCount(meeting: IMeeting): number {
    return meeting.participants?.filter(p => !!p.comment).length || 0;
  }

  getAttachmentsCount(meeting: IMeeting): number {
    if (!meeting.attachments) return 0;
    return meeting.attachments.split(/,(?=\/uploads\/center\/)/).filter(Boolean).length;
  }

  getFirstAttachment(meeting: IMeeting): string | null {
    if (!meeting.attachments) return null;
    const list = meeting.attachments.split(/,(?=\/uploads\/center\/)/).filter(Boolean).map(s => s.trim());
    if (list.length === 0) return null;
    const first = list[0];
    // If already an absolute URL, return it
    if (first.startsWith('http') || first.startsWith('https')) return first;

    // Normalize base to use `/api/` (other components use that) — handle apiUrl like `.../api/v1`
    let base = this.meetingService.apiUrl;
    base = base.replace(/\/api\/v1$/, '/api');

    // Ensure no leading slash duplication
    return `${base}/${first.replace(/^\//, '')}`;
  }

  trackById(_index: number, item: IMeeting) {
    return item?.id;
  }
}
export { Meeting };

