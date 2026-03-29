import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ExternalReport } from '../../services/external-report';
import { User } from '../../services/user';
import { Branch } from '../../services/branch';
import { Employee } from '../../services/employee';
import { Department } from '../../services/department';
import { IDepartment } from '../../interfaces/IDepartment';
import { IEmployee } from '../../interfaces/IEmployee';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-external-report-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './new-external-report-modal.html',
  styleUrls: ['../../../styles.scss']
})
export class NewExternalReportModal {
  isOpen = signal(false);
  @Output() save = new EventEmitter<any>();

  // form fields for two-way binding
  title = '';
  content = '';
  departmentId = '';
  assignedToId = '';
  documentToSign: File[] = [];

  // lists
  departments = signal<IDepartment[]>([]);
  employees = signal<IEmployee[]>([]);
  currentBranch = signal<string>('');
  private branchSub?: Subscription;

  // edit mode
  editingId: string | null = null;

  constructor(
    private reportService: ExternalReport,
    private branchService: Branch,
    private empService: Employee,
    private departmentService: Department,
    private userService: User
  ) { }

  open(report?: any) {
    if (report) {
      this.editingId = report.id || null;
      this.title = report.title || '';
      this.content = report.content || '';
      this.departmentId = report.departmentId || '';
      this.assignedToId = report.assignedToId || '';
    } else {
      this.editingId = null;
      this.title = '';
      this.content = '';
      this.departmentId = '';
      this.assignedToId = '';
      this.documentToSign = [];
    }

    // load departments + employees for the current branch once
    this.branchSub = this.branchService.currentBranch$.subscribe(branchName => {
      if (branchName) {
        this.currentBranch.set(branchName);
        this.departmentService.getDepartmentsByBranch(branchName).subscribe((res: any) => {
          this.departments.set(res.departments);
        });
        this.empService.getEmployeesByBranch(branchName).subscribe((res: any) => {
          this.employees.set(res.employees);
        });
        this.branchSub?.unsubscribe();
      }
    });

    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
    this.editingId = null;
  }

  handleDocsInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) this.documentToSign = [...input.files];
    input.value = '';
  }

  removeDocument(index: number) {
    this.documentToSign.splice(index, 1);
  }

  submit(form: NgForm) {
    if (!form.valid) return;
    // If a document to sign was provided, upload it first using User.uploadFiles()
    const proceedWithCreate = (documentLink?: string) => {
      const payload: any = {
        title: this.title,
        content: this.content,
        departmentId: this.departmentId || '',
        assignedToId: this.assignedToId || ''
      };
      if (documentLink) payload.documentToSign = documentLink;

      if (this.editingId) {
        this.reportService.updateExternalReport(this.editingId, payload).subscribe((res: any) => {
          this.save.emit(res);
          this.close();
          form.resetForm();
          this.documentToSign = [];
        });
      } else {
        this.reportService.createExternalReport(payload).subscribe((res: any) => {
          this.save.emit(res);
          this.close();
          form.resetForm();
          this.documentToSign = [];
        });
      }
    };

    if (this.documentToSign && this.documentToSign.length > 0) {
      // upload single file
      const up = new FormData();
      up.append('files', this.documentToSign[0]);
      this.userService.uploadFiles(up).subscribe({
        next: (uploadRes: any) => {
          const links = uploadRes.links || [];
          const link = Array.isArray(links) && links.length ? links[0] : links;
          proceedWithCreate(typeof link === 'string' ? link : '');
        },
        error: (err: any) => {
          console.error('DocumentToSign upload error: ', err);
          // still proceed without document link
          proceedWithCreate();
        }
      });
    } else {
      proceedWithCreate();
    }
  }
}
