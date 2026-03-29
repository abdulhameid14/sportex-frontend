import { Component, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationButton } from "../pagination-button/pagination-button";
import { JisrService } from './../../services/jisr';
import { IJisrAttendanceSummary } from '../../interfaces/IJisr';
import { SkeletonTable } from '../skeleton-table/skeleton-table';

@Component({
  selector: 'app-jisr',
  standalone: true,
  imports: [SkeletonTable, TranslateModule, PaginationButton],
  templateUrl: './jisr.html',
  styleUrls: ['./jisr.scss', '../../../styles.scss']
})
export class Jisr implements OnInit {
  isLoading = signal(true);
  currentTab = signal<'my_attendance' | 'attendance_summary'>('my_attendance');
  attendanceList = signal<IJisrAttendanceSummary[]>([]);
  currentPage = signal(1);
  nextPage = signal<number | null>(null);
  previousPage = signal<number | null>(null);
  totalPages = signal(1);
  constructor(private jisrService: JisrService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats(page: number = 1) {
    this.currentPage.set(page);
    if (this.currentTab() === 'my_attendance') {
      this.isLoading.set(true);
      this.jisrService.getMyAttendance(page).subscribe((response) => {
        this.isLoading.set(false);
        const records = response.data.data.records ?? [];
        this.attendanceList.set(records);
        // Update pagination info
        this.currentPage.set(response.data.data.pagination.current_page);
        this.nextPage.set(response.data.data.pagination.next_page);
        this.previousPage.set(response.data.data.pagination.previous_page);
        this.totalPages.set(response.data.data.pagination.total_pages);
      });
    }

    if (this.currentTab() === 'attendance_summary') {
      this.isLoading.set(true);
      this.jisrService.getAttendanceSummary(page).subscribe((response) => {
        this.isLoading.set(false);
        const records = response.data.data.records ?? [];
        this.attendanceList.set(records);
        // Update pagination info
        this.currentPage.set(response.data.data.pagination.current_page);
        this.nextPage.set(response.data.data.pagination.next_page);
        this.previousPage.set(response.data.data.pagination.previous_page);
        this.totalPages.set(response.data.data.pagination.total_pages);
      });
    }
  }

  changeTab(tab: 'my_attendance' | 'attendance_summary') {
    this.currentTab.set(tab);
    this.loadStats(1);
  }
}
