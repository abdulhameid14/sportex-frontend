import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IDepartment } from '../../interfaces/IDepartment.js';
import { Branch } from '../../services/branch.js';
import { Department } from '../../services/department.js';
import { IRecruitment, recruitmentStatus } from '../../interfaces/IRecruitment.js';
import { HasPermissionDirective } from '../../directives/has-permission.js';
import { IBranch } from '../../interfaces/IBranch.js';

@Component({
  selector: 'app-view-recruitment-modal',
  standalone: true,
  imports: [CommonModule, HasPermissionDirective, FormsModule, TranslateModule],
  templateUrl: './view-recruitment-modal.html',
  styleUrls: ['./view-recruitment-modal.scss', '../../../styles.scss']
})
export class ViewRecruitmentModal {
  recruitment = signal<IRecruitment | null>(null);
  @Output() update = new EventEmitter<IRecruitment>();
  @Output() closed = new EventEmitter<void>();
  isOpen = signal(false);
  editMode = signal(false);
  departments = signal<IDepartment[]>([]);
  branchs = signal<IBranch[]>([]);
  requirments = signal<{ title: string; description: string; mandatory: boolean }[]>([]);
  statuses = signal(Object.values(recruitmentStatus).map(status => ({ name: status })));
  newAttachments: File[] = [];
  currentAttachments = signal<string[]>([]);
  updatedPosition: string = '';
  updatedDepartmentId: string = '';
  updatedDescription: string = '';
  updatedBranch: string = '';
  updatedStatus: string = '';
  updatedActive: boolean = true;

  constructor(private branchService: Branch, private departmentService: Department) {}

  open(recruitment: IRecruitment) {
    this.recruitment.set({ ...recruitment });
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
    this.requirments.set(this.recruitment()?.requirements || []);
    this.updatedPosition = this.recruitment()?.position || '';
    this.updatedDepartmentId = this.recruitment()?.departmentId || '';
    this.updatedBranch = this.recruitment()?.tenantId || '';
    this.updatedDescription = this.recruitment()?.description || '';
    this.updatedStatus = this.recruitment()?.status || '';
    this.updatedActive = this.recruitment()?.active || true;
  }

  // Separate methods to split attachment and document string to array of strings
  get attachments(): string[] {
    return this.recruitment()?.attachments?.split(',') ?? [];
  }

  close() {
    this.isOpen.set(false);
    this.editMode.set(false);
    this.resetAll();
    this.closed.emit();
  }

  removeRequirment(index: number) {
    this.requirments.update(reqs => {
      reqs.splice(index, 1);
      return reqs;
    });
  }

  addRequirment() {
    this.requirments.set([
      ...this.requirments(),
      { title: '', description: '', mandatory: false }
    ]);
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

  enableEdit() {
    this.editMode.set(true);
  }

  cancelChanges() {
    if (this.recruitment()) {
      this.resetAll();
    }
    this.editMode.set(false);
  }

  saveChanges() {
    if (this.recruitment) {
      if (this.requirments()[this.requirments().length - 1].title === '') {
        this.removeRequirment(this.requirments().length - 1);
      }
      const formData = new FormData();
      this.newAttachments.forEach(file => {
        formData.append('files', file);
      });
      const updatedRecruitment: any = {
        id: this.recruitment()?.id,
        tenantId: this.updatedBranch,
        requirements: this.requirments(),
        position: this.updatedPosition,
        departmentId: this.updatedDepartmentId,
        description: this.updatedDescription,
        status: this.updatedStatus,
        active: this.updatedActive,
        updatedAttachments: formData,
        currentAttachments: this.currentAttachments().join(',')
      };
      console.log('Saving recruitment from modal:', updatedRecruitment);
      this.update.emit(updatedRecruitment);
      this.close();
    }
  }
}
