import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IDepartment } from '../../interfaces/IDepartment.js';
import { Branch } from '../../services/branch.js';
import { Department } from '../../services/department.js';
import { ITask, taskStatus } from '../../interfaces/ITask.js';
import { HasPermissionDirective } from '../../directives/has-permission.js';
import { Employee } from '../../services/employee.js';
import { IEmployee } from '../../interfaces/IEmployee.js';
import { IUser } from '../../interfaces/IUser.js';
import { IBranch } from '../../interfaces/IBranch.js';

@Component({
  selector: 'app-view-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, HasPermissionDirective],
  templateUrl: './view-task-modal.html',
  styleUrls: ['./view-task-modal.scss', '../../../styles.scss']
})
export class ViewTaskModal {
  @Output() update = new EventEmitter<ITask>();
  @Output() closed = new EventEmitter<void>();
  isOpen = signal(false);
  editMode = signal(false);
  currentUser = signal<IUser | null>(null);
  departments = signal<IDepartment[]>([]);
  branches = signal<IBranch[]>([]);
  employees = signal<IEmployee[]>([]);
  statuses = signal(Object.values(taskStatus).map(status => ({ name: status })));
  task = signal<ITask | null>(null);
  currentAttachments = signal<string[]>([]);
  currentSubAttachments = signal<string[]>([]);
  updatedAttachments: File[] = [];
  updatedSubAttachments: File[] = [];
  updatedPriority = signal<string>('');
  updatedDeadline = signal<string>(new Date().toISOString().split('T')[0]);
  updatedStatus: string = '';
  updatedAssignedEmployeeId: string = '';
  updatedConsultantEmployeeId: string = '';
  updatedBranch: string = '';
  updatedDepartmentId: string = '';
  updatedTitle: string = '';
  updatedDescription: string = '';

  constructor(private branchService: Branch, private departmentService: Department, private empService: Employee) { }

  open(task: ITask) {
    console.log('Opening task modal for task:', task);
    // Copy the task to avoid mutating the original object
    this.task.set({ ...task });
    // Initialize updated fields
    this.resetAllFields();
    // Open the modal
    this.isOpen.set(true);
    // Disable edit mode
    this.editMode.set(false);
    // Load departments and employees for the current branch
    this.branchService.currentBranch$.subscribe(branchName => {
      if (branchName) {
        this.departmentService.getDepartmentsByBranch(branchName).subscribe((res: any) => {
          this.departments.set(res.departments);
        });
        this.empService.getEmployeesByBranch(branchName).subscribe((res: any) => {
          this.employees.set(res.employees);
        });
        this.branchService.getAllBranches().subscribe((res: any) => {
          this.branches.set(res.tenants);
        });
      }
    });
  }

  resetAllFields() {
    // Reset all fields
    if (!this.task) return;
    this.updatedTitle = this.task()!.title;
    this.updatedDescription = this.task()!.description;
    this.updatedStatus = this.task()!.status;
    this.updatedAssignedEmployeeId = this.task()!.assignedToEmployeeId || '';
    this.updatedConsultantEmployeeId =
      this.task()!.consultantEmployeeId
        ? String(this.task()!.consultantEmployeeId)
        : '';

    this.updatedBranch = this.task()!.tenantId || '';
    this.updatedDepartmentId = this.task()!.departmentId || '';
    this.updatedPriority.set(this.mapPriorityToString(this.task()!.priority!.toString()));
    this.updatedDeadline.set(this.formatDateForInput(this.task()!.deadline));
    this.currentAttachments.set([... this.attachments]);
    this.currentSubAttachments.set([... this.submissionAttachments]);
    this.updatedAttachments = [];
    this.updatedSubAttachments = [];
  }

  close() {
    this.isOpen.set(false);
    this.editMode.set(false);
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
    return this.task()?.attachments ? this.task()!.attachments!.split(/,(?=\/uploads\/center\/)/) : [];
  }

  get submissionAttachments(): string[] {
    return this.task()?.submissionAttachments ? this.task()!.submissionAttachments!.split(/,(?=\/uploads\/center\/)/) : [];
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // "YYYY-MM-DD"
  }

  private formatStringForDate(date: string): Date {
    return new Date(date);
  }

  private mapPriorityToNumber(value: string): number {
    switch (value.toLowerCase()) {
      case 'high': return 1;
      case 'medium': return 5;
      case 'low': return 10;
      default: return 5;
    }
  }

  private mapPriorityToString(value: string): string {
    switch (value) {
      case '1': return 'high';
      case '2': return 'high';
      case '3': return 'high';
      case '4': return 'medium';
      case '5': return 'medium';
      case '6': return 'medium';
      case '7': return 'medium';
      case '8': return 'low';
      case '9': return 'low';
      case '10': return 'low';
      default: return 'medium';
    }
  }

  removeNewAttachment(index: number) {
    this.updatedAttachments.splice(index, 1);
  }

  removeCurrentAttachment(index: number) {
    this.currentAttachments.set(this.currentAttachments().filter((_, i) => i !== index));
  }

  removeNewSubAttachment(index: number) {
    this.updatedSubAttachments.splice(index, 1);
  }

  removeCurrentSubAttachment(index: number) {
    this.currentSubAttachments.set(this.currentSubAttachments().filter((_, i) => i !== index));
  }

  handleAttachmentInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.updatedAttachments = [...input.files];
    }
    input.value = ''; // reset input field
  }

  handleSubAttachmentInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.updatedSubAttachments = [...input.files];
    }
    input.value = ''; // reset input field
  }

  saveChanges() {
    if (this.task) {
      const attachments = new FormData();
      this.updatedAttachments.forEach(file => {
        attachments.append('files', file);
      });
      const submissionAttachments = new FormData();
      this.updatedSubAttachments.forEach(file => {
        submissionAttachments.append('files', file);
      });
      const updatedTask: any = {
        id: this.task()!.id,
        tenantId: this.updatedBranch ? this.updatedBranch : this.task()!.tenantId,
        currentAttachments: this.currentAttachments().join(','),
        updatedAttachments: attachments,
        currentSubAttachments: this.currentSubAttachments().join(','),
        updatedSubAttachments: submissionAttachments,
        priority: this.updatedPriority() ? this.mapPriorityToNumber(this.updatedPriority()) : this.mapPriorityToNumber(this.mapPriorityToString(this.task()!.priority.toString())),
        deadline: this.updatedDeadline() ? this.formatStringForDate(this.updatedDeadline()) : this.task()!.deadline,
        status: this.updatedStatus ? this.updatedStatus : this.task()!.status,
        assignedToEmployeeId: this.updatedAssignedEmployeeId ? this.updatedAssignedEmployeeId : this.task()!.assignedToEmployeeId,
        consultantEmployeeId: this.updatedConsultantEmployeeId ? this.updatedConsultantEmployeeId : this.task()!.consultantEmployeeId,
        departmentId: this.updatedDepartmentId ? this.updatedDepartmentId : this.task()!.departmentId,
        title: this.updatedTitle ? this.updatedTitle : this.task()!.title,
        description: this.updatedDescription ? this.updatedDescription : this.task()!.description
      };
      console.log('Saving task from modal:', updatedTask);
      this.update.emit(updatedTask);
      this.close();
    }
  }
}
