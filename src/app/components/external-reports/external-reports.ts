import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ExternalReport } from '../../services/external-report';
import { IExternalReport } from '../../interfaces/IExternalReport';
import { NewExternalReportModal } from '../new-external-report-modal/new-external-report-modal';
import { User } from '../../services/user';
import { IUser } from '../../interfaces/IUser';
import { Branch } from '../../services/branch';
import { ToastService } from '../../services/toast';
import { Toast } from '../toast/toast';

@Component({
  selector: 'app-external-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NewExternalReportModal, Toast],
  templateUrl: './external-reports.html',
  styleUrls: ['../../../styles.scss']
})
export class ExternalReports implements OnInit {
  reports = signal<IExternalReport[]>([]);
  isLoading = signal(false);
  currentUser = signal<IUser | null>(null);

  @ViewChild(NewExternalReportModal) newModal!: NewExternalReportModal;

  constructor(
    private reportService: ExternalReport,
    private userService: User,
    private branchService: Branch,
    private toast: ToastService
  ) { }

  ngOnInit() {
    this.loadReports();
    // Get current user
    this.userService.getCurrentUser().subscribe((user: any) => {
      this.currentUser.set(user.user);
    });
  }

  loadReports() {
    this.isLoading.set(true);
    this.reportService.getExternalReports().subscribe((res: any) => {
      // Normalize response: API may return an array or an object wrapper
      let reports: IExternalReport[] = [];
      if (Array.isArray(res)) {
        reports = res;
      } else if (res && Array.isArray(res.reports)) {
        reports = res.reports;
      } else if (res && Array.isArray(res.externalReports)) {
        reports = res.externalReports;
      } else if (res && Array.isArray(res.data)) {
        reports = res.data;
      } else {
        console.warn('Unexpected external reports response shape, setting empty list', res);
        reports = [];
      }
      // Sort by createdAt descending (newest first)
      reports.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      this.reports.set(reports);
      this.isLoading.set(false);
    }, () => this.isLoading.set(false));
  }

  openNew() {
    this.newModal.open();
  }

  editReport(report: IExternalReport) {
    this.newModal.open(report);
  }

  handleSave(created: any) {
    this.loadReports();
  }

  deleteReport(id: string) {
    if (!confirm('Delete this report?')) return;
    this.reportService.deleteExternalReport(id).subscribe(() => this.loadReports());
  }

  signReport(report: IExternalReport) {
    // Sign the document using the new external-reports/sign endpoint
    this.reportService.signExternalReport(report.id || '').subscribe((res: any) => {
      this.toast.show('Document signed successfully', 'success');
      this.loadReports();
    }, (err: any) => {
      console.error('Error signing document:', err);
      this.toast.show('Error signing document', 'error');
    });
  }

  isCurrentUserAssignee(report: IExternalReport): boolean {
    const currentEmpId = this.currentUser()?.employee?.id;
    return !!currentEmpId && currentEmpId === report.assignedToId && !report.signed;
  }
}
