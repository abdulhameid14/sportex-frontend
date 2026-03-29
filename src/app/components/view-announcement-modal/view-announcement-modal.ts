import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IDepartment } from '../../interfaces/IDepartment.js';
import { Branch } from '../../services/branch.js';
import { Department } from '../../services/department.js';
import { IAnnouncement } from '../../interfaces/IAnnouncement.js';
import { HasPermissionDirective } from '../../directives/has-permission.js';
import { IBranch } from '../../interfaces/IBranch.js';

@Component({
  selector: 'app-view-announcement-modal',
  standalone: true,
  imports: [CommonModule, HasPermissionDirective, FormsModule, TranslateModule],
  templateUrl: './view-announcement-modal.html',
  styleUrls: ['./view-announcement-modal.scss', '../../../styles.scss']
})
export class ViewAnnouncementModal {
  ann = signal<IAnnouncement | null>(null);
  @Output() update = new EventEmitter<IAnnouncement>();
  @Output() closed = new EventEmitter<void>();
  isOpen = signal(false);
  editMode = signal(false);
  departments = signal<IDepartment[]>([]);
  branchs = signal<IBranch[]>([]);
  newAttachments: File[] = [];
  currentAttachments = signal<string[]>([]);
  updatedTitle: string = '';
  updatedContent: string = '';
  updatedDepartmentId: string = '';
  updatedBranch: string = '';
  updatedActive: boolean = false;

  constructor(private branchService: Branch, private departmentService: Department) {}

  open(announcement: IAnnouncement) {
    this.ann.set({ ...announcement });
    this.updatedTitle = announcement.title;
    this.updatedContent = announcement.content;
    this.updatedDepartmentId = announcement.department?.id || '';
    this.updatedBranch = announcement.tenantId || '';
    this.updatedActive = announcement.active || false;
    this.currentAttachments.set(this.attachments);
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

  close() {
    this.isOpen.set(false);
    if (this.ann()) {
      this.newAttachments = [];
      this.updatedTitle = this.ann()!.title;
      this.updatedContent = this.ann()!.content;
      this.updatedDepartmentId = this.ann()!.department?.id || '';
      this.updatedBranch = this.ann()!.tenantId || '';
      this.updatedActive = this.ann()!.active || false;
    }
    this.closed.emit();
  }

  enableEdit() {
    this.editMode.set(true);
  }

  cancelChanges() {
    if (this.ann()) {
      this.currentAttachments.set(this.attachments);
      this.newAttachments = [];
      this.updatedTitle = this.ann()!.title;
      this.updatedContent = this.ann()!.content;
      this.updatedDepartmentId = this.ann()!.department?.id || '';
      this.updatedBranch = this.ann()!.tenantId || '';
      this.updatedActive = this.ann()!.active || false;
    }
    this.editMode.set(false);
  }

  // Separate methods to split attachment and document string to array of strings
  get attachments(): string[] {
    return this.ann()?.attachments ? this.ann()!.attachments!.split(/,(?=\/uploads\/center\/)/) : [];
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
    if (this.ann) {
      const formData = new FormData();
      this.newAttachments.forEach(file => {
        formData.append('files', file);
      });
      const updatedAnn: any = {
        id: this.ann()!.id,
        tenantId: this.updatedBranch,
        title: this.updatedTitle,
        content: this.updatedContent,
        departmentId: this.updatedDepartmentId,
        active: this.updatedActive,
        newAttachments: formData,
        currentAttachments: this.currentAttachments().join(',')
      };
      console.log('Saving announcement from modal:', updatedAnn);
      this.update.emit(updatedAnn);
      this.close();
    }
  }

}
