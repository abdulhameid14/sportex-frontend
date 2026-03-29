import { Component, EventEmitter, Output, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ITask, taskStatus } from '../../interfaces/ITask';
import { IDepartment } from '../../interfaces/IDepartment';
import { TranslateModule } from '@ngx-translate/core';
import { Department } from '../../services/department';
import { Branch } from './../../services/branch';
import { Employee } from '../../services/employee';
import { Task } from '../../services/task';
import { IEmployee } from '../../interfaces/IEmployee';
import { Subscription } from 'rxjs';
import { IUser } from '../../interfaces/IUser';

@Component({
  selector: 'app-new-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './new-task-modal.html',
  styleUrls: ['./new-task-modal.scss', '../../../styles.scss']
})
export class NewTaskModal implements OnDestroy {
  isOpen = signal(false);
  @Output() save = new EventEmitter<ITask>();
  taskStatus = taskStatus;
  attachments: File[] = [];
  submissionAttachments: File[] = [];
  departments = signal<IDepartment[]>([]);
  employees = signal<IEmployee[]>([]);
  currentBranch = signal<string>('');
  currentUser = signal<IUser | null>(null);
  private branchSub?: Subscription;

  constructor(private departmentService: Department, private branchService: Branch, private empService: Employee, private taskService: Task) { }

  open() {
    this.isOpen.set(true);
    this.branchSub = this.branchService.currentBranch$.subscribe(branchName => {
      if (branchName) {
        this.currentBranch.set(branchName);
        this.departmentService.getDepartmentsByBranch(branchName).subscribe((res: any) => {
          this.departments.set(res.departments);
        });
        this.empService.getEmployeesByBranch(branchName).subscribe((res: any) => {
          this.employees.set(res.employees);
        });
        this.branchService.currentUser$.subscribe(user => {
          this.currentUser.set(user);
        });
        // Unsubscribe after loading once
        this.branchSub?.unsubscribe();
      }
    });
  }

  close() {
    this.isOpen.set(false);
  }

  ngOnDestroy() {
    this.branchSub?.unsubscribe();
  }

  removeAttachment(index: number) {
    this.attachments.splice(index, 1);
  }

  removeSubmissionAttachment(index: number) {
    this.submissionAttachments.splice(index, 1);
  }

  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.attachments = [...input.files];
    }
    input.value = ''; // reset input field
  }

  handleSubmissionFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.submissionAttachments = [...input.files];
    }
    input.value = ''; // reset input field
  }

  private mapPriority(value: string): number {
    switch (value.toLowerCase()) {
      case 'high': return 1;
      case 'medium': return 5;
      case 'low': return 10;
      default: return 5;
    }
  }

  submit(form: NgForm) {
    if (form.valid) {
      const formData = new FormData();
      this.attachments.forEach(file => {
        formData.append('files', file);
      });
      const formSubmissionData = new FormData();
      this.submissionAttachments.forEach(file => {
        formSubmissionData.append('files', file);
      });
      const newTask: any = {
        tenantId: this.currentBranch(),
        title: form.value.title,
        description: form.value.description,
        priority: this.mapPriority(form.value.priority),
        departmentId: form.value.departmentId,
        status: this.taskStatus.PENDING,
        createdByEmployeeId: this.currentUser()?.employee?.id,
        assignedToEmployeeId: form.value.assignedToEmployee.id,
        consultantEmployeeId: form.value.consultantEmployee.id,
        attachments: formData,
        submissionAttachments: formSubmissionData,
        deadline: form.value.deadline ? new Date(form.value.deadline) : new Date(),
        assignedToEmployee: { name: form.value.assignedToEmployee.name },
        consultantEmployee: { name: form.value.consultantEmployee.name },
        createdByEmployee: { name: this.currentUser()?.employee?.name }
      };
      this.save.emit(newTask);
      this.close();
      form.resetForm();
      this.attachments = [];
    }
  }
}
