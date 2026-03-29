import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IDepartment } from '../../interfaces/IDepartment.js';
import { Branch } from '../../services/branch.js';
import { Department } from '../../services/department.js';
import { IRequest, status, request_action } from '../../interfaces/IRequest.js';
import { HasPermissionDirective } from '../../directives/has-permission.js';
import { Employee } from '../../services/employee.js';
import { IEmployee } from '../../interfaces/IEmployee.js';
import { Task } from '../../services/task.js';
import { Project } from '../../services/project.js';
import { ITask } from '../../interfaces/ITask.js';
import { IProject } from '../../interfaces/IProject.js';
import { IBranch } from '../../interfaces/IBranch.js';

@Component({
  selector: 'app-view-request-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, HasPermissionDirective],
  templateUrl: './view-request-modal.html',
  styleUrls: ['./view-request-modal.scss', '../../../styles.scss']
})
export class ViewRequestModal {
  request = signal<IRequest | null>(null);
  @Output() update = new EventEmitter<IRequest>();
  @Output() closed = new EventEmitter<void>();
  isOpen = signal(false);
  editMode = signal(false);
  departments = signal<IDepartment[]>([]);
  branches = signal<IBranch[]>([]);
  employees = signal<IEmployee[]>([]);
  tasks = signal<ITask[]>([]);
  projects = signal<IProject[]>([]);
  statuses = signal(Object.values(status).map(status => ({ name: status })));
  actions = signal(Object.values(request_action).map(action => ({ name: action })));
  signersNames = signal<string[]>([]);
  newAttachments: File[] = [];
  currentAttachments = signal<string[]>([]);
  updatedTitle: string = '';
  updatedDescription: string = '';
  updatedStatus: string = '';
  updatedAction: string = '';
  updatedAssigneeId: string = '';
  updatedBranch: string = '';
  updatedTaskId: string = '';
  updatedProjectId: string = '';
  updatedDepartmentId: string = '';
  updatedTo: string = '';
  //updatedCount: number = 0;
  updatedBudget: number = 0;
  fee: boolean = false;
  //updatedSigners: IRequestSigners[] = [];

  constructor(private branchService: Branch, private departmentService: Department, private empService: Employee, private taskServ: Task, private projectServ: Project) {
  }

  open(request: IRequest) {
    console.log('Opening request modal for request:', request);
    this.request.set({ ...request });
    this.isOpen.set(true);
    this.editMode.set(false);
    this.resetAll();
    this.signersNames.set([]); // reset before loading
    request!.signers!.forEach(signer => {
      this.empService.getEmployeeById(signer.employeeId).subscribe((res: any) => {
        this.signersNames.update(names => [...names, res.employee.name]);
      });
    });
    console.log('Request signers:', this.signersNames());
    this.branchService.currentBranch$.subscribe(branchName => {
      if (branchName) {
        this.departmentService.getDepartmentsByBranch(branchName).subscribe((res: any) => {
          this.departments.set(res.departments);
        });
        this.empService.getEmployeesByBranch(branchName).subscribe((res: any) => {
          this.employees.set(res.employees);
        });
        this.taskServ.getTasksByBranch(branchName).subscribe((res: any) => {
          this.tasks.set(res.tasks);
        });
        this.projectServ.getProjectsByBranch(branchName).subscribe((res: any) => {
          this.projects.set(res.projects);
        });
        this.branchService.getAllBranches().subscribe((res: any) => {
          this.branches.set(res.tenants);
        });
      }
    });
  }

  resetAll() {
    if (this.request) {
      this.newAttachments = [];
      this.currentAttachments.set(this.attachments);
      //this.updatedSigners = this.request?.signers || [];
      this.updatedBranch = this.request()?.tenantId || '';
      this.updatedTitle = this.request()?.title || '';
      this.updatedDescription = this.request()?.description || '';
      this.updatedStatus = this.request()?.status || '';
      this.updatedAction = this.request()?.action || '';
      this.updatedAssigneeId = this.request()?.assigneeEmployeeId || '';
      this.updatedTaskId = this.request()?.taskId!;
      this.updatedProjectId = this.request()?.projectId!;
      this.updatedDepartmentId = this.request()?.departmentId || '';
      this.updatedTo = this.request()?.to || '';
      //this.updatedCount = this.request()?.count || 0;
      this.updatedBudget = this.request()?.budget || 0;
      this.fee = this.request()?.fee || false;

    }
  }

  close() {
    this.isOpen.set(false);
    this.resetAll();
    this.closed.emit();
  }

  enableEdit() {
    this.editMode.set(true);
  }

  cancelChanges() {
    this.resetAll();
    this.editMode.set(false);
  }

  onTaskSelected(value: any) {
    this.updatedTaskId = value;
  }

  onProjectSelected(value: any) {
    this.updatedProjectId = value;
  }

  // true if user selected EITHER task or project
  isTaskOrProjectValid() {
    return this.updatedTaskId || this.updatedProjectId;
  }

  // Separate methods to split attachment and document string to array of strings
  get attachments(): string[] {
    return this.request()?.attachments?.split(/,(?=\/uploads\/center\/)/) ?? [];
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
    if (this.request) {
      const formData = new FormData();
      this.newAttachments.forEach(file => {
        formData.append('files', file);
      });
      const updatedRequets: any = {
        id: this.request()!.id,
        tenantId: this.updatedBranch,
        title: this.updatedTitle,
        description: this.updatedDescription,
        status: this.updatedStatus,
        action: this.updatedAction,
        assigneeEmployeeId: this.updatedAssigneeId,
        departmentId: this.updatedDepartmentId,
        to: this.updatedTo,
        budget: this.updatedBudget,
        //count: this.updatedCount,
        taskId: this.updatedTaskId,
        projectId: this.updatedProjectId,
        currentAttachments: this.currentAttachments().join(','),
        newAttachments: formData,
        //signers: this.updatedSigners,
      };
      console.log('Saving request from modal:', updatedRequets);
      this.update.emit(updatedRequets);
      this.close();
    }
  }
}
