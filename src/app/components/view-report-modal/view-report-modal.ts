import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IDepartment } from '../../interfaces/IDepartment.js';
import { Branch } from '../../services/branch.js';
import { Department } from '../../services/department.js';
import { IReport } from '../../interfaces/IReport.js';
import { HasPermissionDirective } from '../../directives/has-permission.js';
import { IBranch } from '../../interfaces/IBranch.js';

@Component({
  selector: 'app-view-report-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, HasPermissionDirective],
  templateUrl: './view-report-modal.html',
  styleUrls: ['./view-report-modal.scss', '../../../styles.scss']
})
export class ViewReportModal {
  report = signal<IReport | null>(null);
  @Output() update = new EventEmitter<IReport>();
  @Output() closed = new EventEmitter<void>();
  isOpen = signal(false);
  editMode = signal(false);
  branchs = signal<IBranch[]>([]);
  departments = signal<IDepartment[]>([]);
  newAttachments: File[] = [];
  currentAttachments = signal<string[]>([]);
  updatedTitle: string = '';
  updatedContent: string = '';
  updatedBranch: string = '';
  updatedDepartmentId: string = '';

  constructor(private branchService: Branch, private departmentService: Department) {}

  open(report: IReport) {
    this.report.set({ ...report });
    this.resetAll();
    this.isOpen.set(true);
    this.editMode.set(false);
    this.branchService.currentBranch$.subscribe(branchName => {
      if (branchName) {
        this.departmentService.getDepartmentsByBranch(branchName).subscribe((res: any) => {
          this.departments.set(res.departments);
        });
        this.branchService.getAllBranches().subscribe((res: any) => {
          this.branchs.set(res.tenants);
        });
      }
    });
  }

  resetAll(){
    this.newAttachments = [];
    this.currentAttachments.set(this.attachments);
    this.updatedTitle = this.report()?.title || '';
    this.updatedBranch = this.report()?.tenantId || '';
    this.updatedContent = this.report()?.content || '';
    this.updatedDepartmentId = this.report()?.departmentId || '';
  }

  close() {
    this.isOpen.set(false);
    this.resetAll();
    this.closed.emit();
  }

  // Separate methods to split attachment and document string to array of strings
  get attachments(): string[] {
    return this.report()?.attachments?.split(/,(?=\/uploads\/center\/)/) ?? [];
  }

  enableEdit() {
    this.editMode.set(true);
  }

  cancelChanges() {
    this.resetAll();
    this.editMode.set(false);
  }

  removeNewAttachment(index: number) {
    this.newAttachments.splice(index, 1);
  }

  removeCurrentAttachment(index: number) {
    this.currentAttachments.set(this.currentAttachments().filter((_, i) => i !== index));
  }

  handleAttachmentInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.newAttachments = [...input.files];
    }
    input.value = ''; // reset input field
  }

  saveChanges() {
    if (this.report) {
      const formData = new FormData();
      this.newAttachments.forEach(file => {
        formData.append('files', file);
      });
      const newReport: any = {
        id: this.report()?.id,
        tenantId: this.updatedBranch,
        title: this.updatedTitle,
        content: this.updatedContent,
        departmentId: this.updatedDepartmentId,
        updatedAttachments: formData,
        currentAttachments: this.currentAttachments().join(',')
      };
      console.log('new Report from modal:', newReport);
      this.update.emit(newReport);
      this.close();
    }
  }
}
