import { Component, EventEmitter, Output, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { IRequest, IRequestType, request_action, status } from '../../interfaces/IRequest';
import { TranslateModule } from '@ngx-translate/core';
import { Branch } from './../../services/branch';
import { Employee } from '../../services/employee';
import { IEmployee } from '../../interfaces/IEmployee';
import { Subscription } from 'rxjs';
import { Request } from '../../services/request';
import { IDepartment } from '../../interfaces/IDepartment';
import { Department } from '../../services/department';
import { IUser } from '../../interfaces/IUser';
import { Task } from '../../services/task';
import { Project } from '../../services/project';
import { ITask } from '../../interfaces/ITask';
import { IProject } from '../../interfaces/IProject';

@Component({
  selector: 'app-new-request-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './new-request-modal.html',
  styleUrls: ['./new-request-modal.scss', '../../../styles.scss']
})
export class NewRequestModal implements OnDestroy {
  isOpen = signal(false);
  @Output() save = new EventEmitter<IRequest>();
  attachments: File[] = [];
  documentToSign: File[] = [];
  departments = signal<IDepartment[]>([]);
  employees = signal<IEmployee[]>([]);
  tasks = signal<ITask[]>([]);
  projects = signal<IProject[]>([]);
  requestTypes = signal<IRequestType[]>([]);
  currentBranch = signal<string>('');
  currentUser = signal<IUser | null>(null);
  actions = signal(Object.values(request_action).map(action => ({ name: action })));
  private branchSub?: Subscription;
  requestStatus = status;
  selectedTaskId: any = null;
  selectedProjectId: any = null;
  feesStatus = signal<string>('');

  constructor( private branchService: Branch,
    private empService: Employee,
    private requestService: Request,
    private departmentService: Department,
    private taskService: Task,
    private projectService: Project
  ) {}

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
        this.requestService.getRequestTypes(branchName).subscribe((res: any) => {
          this.requestTypes.set(res.requestTypes);
        });
        this.branchService.currentUser$.subscribe(user => {
          this.currentUser.set(user);
        });
        this.taskService.getTasksByBranch(branchName).subscribe((res: any) => {
          this.tasks.set(res.tasks);
        });
        this.projectService.getProjectsByBranch(branchName).subscribe((res: any) => {
          this.projects.set(res.projects);
        });
        // Unsubscribe after loading once
        this.branchSub?.unsubscribe();
      }
    });
  }

  close() {
    this.isOpen.set(false);
  }

  onTaskSelected(value: any) {
    this.selectedTaskId = value;
  }

  onProjectSelected(value: any) {
    this.selectedProjectId = value;
  }

  // true if user selected EITHER task or project
  isTaskOrProjectValid() {
    return this.selectedTaskId || this.selectedProjectId;
  }

  removeAttachment(index: number) {
    this.attachments.splice(index, 1);
  }

  handleAttachmentsInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.attachments = [...input.files];
    }
    input.value = ''; // reset input field
  }

  submit(form: NgForm) {
    if (form.valid) {
      const formData = new FormData();
      this.attachments.forEach(file => {
        formData.append('files', file);
      });
      let budgetValue = 0;
      if (this.feesStatus() === 'expenses') {
        budgetValue = form.value.budget;
      } else if (this.feesStatus() === 'income') {
        budgetValue = -Math.abs(form.value.budget);
      }
      const newRequest: any = {
        tenantId: this.currentBranch(),
        title: form.value.title,
        description: form.value.description,
        typeId: form.value.reqType.id,
        departmentId: form.value.departmentId,
        attachments: formData,
        assigneeEmployeeId: form.value.assigneeEmployeeId,
        requesterEmployeeId: this.currentUser()?.employee?.id,
        status: this.requestStatus.PENDING,
        requesterEmployee: { name: this.currentUser()?.employee?.name },
        type: { name: form.value.reqType.name },
        createdAt: new Date(),
        budget: budgetValue,
        count: form.value.count,
        taskId: this.selectedTaskId,
        projectId: this.selectedProjectId,
        to: form.value.to,
        action: form.value.action,
      };
      console.log('New Request to submit: ', newRequest);
      this.save.emit(newRequest);
      this.close();
      form.resetForm();
      this.attachments = [];
      this.documentToSign = [];
    }
  }

  ngOnDestroy() {
    this.branchSub?.unsubscribe();
  }
}
