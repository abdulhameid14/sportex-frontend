import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IDepartment } from '../../interfaces/IDepartment.js';
import { Branch } from '../../services/branch.js';
import { Department } from '../../services/department.js';
import { IReport,reportType } from '../../interfaces/IReport.js';
import { HasPermissionDirective } from '../../directives/has-permission.js';
import { IBranch } from '../../interfaces/IBranch.js';

@Component({
  selector: 'app-view-transaction-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, HasPermissionDirective],
  templateUrl: './view-transaction-modal.html',
  styleUrls: ['./view-transaction-modal.scss', '../../../styles.scss']
})
export class ViewTransactionModal {
  @Output() update = new EventEmitter<IReport>();
  @Output() closed = new EventEmitter<void>();
  transaction = signal<IReport | null>(null);
  isOpen = signal(false);
  editMode = signal(false);
  departments = signal<IDepartment[]>([]);
  branches = signal<IBranch[]>([]);
  currentAttachments = signal<string[]>([]);
  updatedAttachments: File[] = [];
  updatedTitle: string = '';
  updatedContent: string = '';
  updatedDepartmentId: string = '';
  updatedTransFees: number | null = null;
  updatedBranch: string = '';
  // updatedTransTitle: string = '';
  // updatedTransDescription: string = '';
  // updatedTransDate: string = '';

  constructor(private branchService: Branch, private departmentService: Department) {
  }

  open(transaction: IReport) {
    console.log('Opening transaction modal for:', transaction);
    this.transaction.set({ ...transaction });
    // Initialize updated fields
    this.resetAllFields();
    // Open the modal
    this.isOpen.set(true);
    this.editMode.set(false);
    this.branchService.currentBranch$.subscribe(branchName => {
      if (branchName) {
        this.departmentService.getDepartmentsByBranch(branchName).subscribe((res: any) => {
          this.departments.set(res.departments);
        });
        this.branchService.getAllBranches().subscribe((res: any) => {
          this.branches.set(res.tenants);
        });
      }
    });
  }

  resetAllFields(){
    if (this.transaction()) {
      this.updatedTitle = this.transaction()!.title!;
      this.updatedContent = this.transaction()!.content!;
      this.updatedDepartmentId = this.transaction()!.departmentId || '';
      this.updatedBranch = this.transaction()!.tenantId || '';
      this.updatedTransFees = this.transaction()!.data?.reportTypeObject.fees || null;
      this.currentAttachments.set(this.attachments);
      this.updatedAttachments = [];
      // this.updatedTransTitle = this.transaction.data?.reportTypeObject.title || '';
      // this.updatedTransDescription = this.transaction.data?.reportTypeObject.description || '';
      // this.updatedTransDate = this.formatDateForInput(this.transaction.data?.reportTypeObject.date || new Date());
    }
  }

  close() {
    this.isOpen.set(false);
    this.resetAllFields();
    this.closed.emit();
  }

  enableEdit() {
    this.editMode.set(true);
  }

  cancelChanges() {
    this.resetAllFields();
    this.editMode.set(false);
  }

  // Separate methods to split attachment and document string to array of strings
  get attachments(): string[] {
    return this.transaction()?.attachments ? this.transaction()!.attachments!.split(/,(?=\/uploads\/center\/)/) : [];
  }

  removeNewAttachment(index: number) {
    this.updatedAttachments.splice(index, 1);
  }

  removeCurrentAttachment(index: number) {
    this.currentAttachments.set(this.currentAttachments().filter((_, i) => i !== index));
  }

  handleAttachmentInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.updatedAttachments = [...input.files];
    }
    input.value = ''; // reset input field
  }

  saveChanges() {
    if (this.transaction()) {
      const attachments = new FormData();
      this.updatedAttachments.forEach(file => {
        attachments.append('files', file);
      });
      const newTransaction: any = {
        id: this.transaction()!.id,
        tenantId: this.updatedBranch ? this.updatedBranch : this.transaction()!.tenantId,
        title: this.updatedTitle? this.updatedTitle : this.transaction()!.title,
        content: this.updatedContent? this.updatedContent : this.transaction()!.content,
        departmentId: this.updatedDepartmentId ? this.updatedDepartmentId : this.transaction()!.departmentId,
        data: {
          reportTypeObject: {
            fees: this.updatedTransFees ? this.updatedTransFees : this.transaction()!.data?.reportTypeObject.fees,
            // title: this.updatedTransTitle ? this.updatedTransTitle : this.transaction.data?.reportTypeObject.title,
            // description: this.updatedTransDescription ? this.updatedTransDescription : this.transaction.data?.reportTypeObject.description,
            // date: this.updatedTransDate ? this.formatStringForDate(this.updatedTransDate) : this.transaction.data?.reportTypeObject.date
          },
          reportType: reportType.Transaction
        },
        currentAttachments: this.currentAttachments().join(','),
        updatedAttachments: attachments,
      };
      console.log('Saving transaction from modal:', newTransaction);
      this.update.emit(newTransaction);
      this.close();
    }
  }
}
