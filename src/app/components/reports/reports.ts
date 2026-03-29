import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { DeleteValidationModal } from './../delete-validation-modal/delete-validation-modal';
import { NewReportModal } from './../new-report-modal/new-report-modal';
import { ViewReportModal } from './../view-report-modal/view-report-modal';
import { IReport } from '../../interfaces/IReport';
import { Report } from '../../services/report';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationButton } from "../pagination-button/pagination-button";
import { Branch } from '../../services/branch';
import { User } from '../../services/user';
import { HasPermissionDirective } from '../../directives/has-permission';
import { Router } from '@angular/router';
import { HasAnyPermissionDirective } from '../../directives/hasAnyPermission';
import { SkeletonTable } from '../skeleton-table/skeleton-table';
import { Toast } from '../toast/toast';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [NewReportModal, Toast, SkeletonTable, HasAnyPermissionDirective, HasPermissionDirective, ViewReportModal, DatePipe, DeleteValidationModal, TranslateModule, PaginationButton],
  templateUrl: './reports.html',
  styleUrls: ['./reports.scss', '../../../styles.scss']
})
export class Reports implements OnInit {
  isLoading = signal<boolean>(true);
  reportList = signal<IReport[]>([]);
  @ViewChild(NewReportModal) reportModal!: NewReportModal;
  @ViewChild(ViewReportModal) viewModal!: ViewReportModal;
  @ViewChild(DeleteValidationModal) deleteModal!: DeleteValidationModal;
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(0);
  currentBranch = signal<string>('');
  lastPageReached = signal(false);
  lastPage = signal(10000); // Set initial large number

  constructor(private reportService: Report, private branchService: Branch, private userServ: User, private router: Router, private toast: ToastService) {}

  ngOnInit() {
    this.branchService.currentBranch$.subscribe(branch => {
      this.currentBranch.set(branch);
      this.loadReports(1);
    });
  }

  loadReports(page: number, branchName: string = this.currentBranch()) {
    this.isLoading.set(true);
    this.reportService.getReports(page, branchName).subscribe((res: any) => {
      if (res.length === 0 && page > 1) {
        this.loadReports(page - 1, branchName);
        this.lastPageReached.set(true);
        this.lastPage.set(page - 1);
        this.isLoading.set(false);
        return;
      }
      if (page === this.lastPage()){
        this.lastPageReached.set(true);
      } else {
        this.lastPageReached.set(false);
      }
      this.reportList.set(res);
      this.itemsPerPage.set(res.length);
      this.currentPage.set(page);
      this.isLoading.set(false);
    });
  }

  openNewReportModal() {
    this.reportModal.open();
  }

  openViewReportModal(report: IReport) {
    this.viewModal.open(report);
  }

  updateReport(submitedReport: any) {
    if (submitedReport.updatedAttachments.getAll('files').length === 0){
      const newReport: IReport = {
        tenantId: submitedReport.tenantId,
        title: submitedReport.title,
        content: submitedReport.content,
        departmentId: submitedReport.departmentId,
        attachments: submitedReport.currentAttachments,
      };
      console.log('Updated report: ', newReport);
      this.reportService.updateReport(submitedReport.id!, newReport).subscribe((res: any) => {
        this.toast.show('Report updated successfully', 'success');
        // Force route reload
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/reports']);
        });
      });
    }
    else {
      this.userServ.uploadFiles(submitedReport.updatedAttachments).subscribe({
        next: (uploadRes: any) => {
          const attachments = uploadRes.links;
          if (!Array.isArray(submitedReport.currentAttachments)) {
            submitedReport.currentAttachments = submitedReport.currentAttachments ? submitedReport.currentAttachments.split(/,(?=\/uploads\/center\/)/) : [];
          }
          submitedReport.currentAttachments = [
            ...submitedReport.currentAttachments,
            ...attachments
          ].join(',');
          console.log('Updated attachments: ', submitedReport.currentAttachments);
          const newReport: IReport = {
            tenantId: submitedReport.tenantId,
            title: submitedReport.title,
            content: submitedReport.content,
            departmentId: submitedReport.departmentId,
            attachments: submitedReport.currentAttachments,
          };
          console.log('Updated report: ', newReport);
          this.reportService.updateReport(submitedReport.id!, newReport).subscribe((res: any) => {
            this.toast.show('Report updated successfully', 'success');
            // Force route reload
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/reports']);
            });
          });
        },
        error: (err: any) => {
          console.error('Error uploading files: ', err);
        }
      });
    }
  }

  handleAttachmentsList(list: string[]): string {
    let attachments: string = '';
    for (let i = 0; i < list.length; i++) {
      attachments += list[i] + ',';
    }
    return attachments.slice(0, -1);
  }

  saveNewReport(submitedReport: any) {
    if (submitedReport.attachments.getAll('files').length === 0){
      const newReport: IReport = {
        tenantId: submitedReport.tenantId,
        title: submitedReport.title,
        content: submitedReport.content,
        departmentId: submitedReport.departmentId,
        data: submitedReport.data,
        attachments: '',
        creatorId: submitedReport.creatorId
      };
      this.reportService.createReport(newReport).subscribe((res: any) => {
        this.toast.show('Report created successfully', 'success');
        // Force route reload
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/reports']);
        });
      });
    }
    else {
      this.userServ.uploadFiles(submitedReport.attachments).subscribe({
        next: (uploadRes: any) => {
          const attachments = uploadRes.links;
          const newReport: IReport = {
            tenantId: submitedReport.tenantId,
            title: submitedReport.title,
            content: submitedReport.content,
            departmentId: submitedReport.departmentId,
            data: submitedReport.data,
            attachments: this.handleAttachmentsList(attachments),
            creatorId: submitedReport.creatorId
          };
          console.log('New report attachments: ', newReport.attachments);
          this.reportService.createReport(newReport).subscribe((res: any) => {
            this.toast.show('Report created successfully', 'success');
            // Force route reload
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/reports']);
            });
          });
        },
        error: (err: any) => {
          console.error('Error uploading files: ', err);
        }
      });
    }
  }

  deleteReport(reportId: string | undefined) {
    if (!reportId) {
      // Remove first element in taskList
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res){
          this.reportList.update(list => list.slice(1));
          this.toast.show('Report deleted successfully', 'success');
        }
      });
    }
    else {
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res){
          this.reportService.deleteReport(reportId).subscribe(() => {
            this.toast.show('Report deleted successfully', 'success');
            this.reportList.update(list => list.filter(report => report.id !== reportId));
          });
        }
      });
    }
  }
}
