import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IDepartment } from '../../interfaces/IDepartment.js';
import { Branch } from '../../services/branch.js';
import { Department } from '../../services/department.js';
import { IProject, ITerm } from '../../interfaces/IProject.js';
import { HasPermissionDirective } from '../../directives/has-permission.js';
import { IEmployee } from '../../interfaces/IEmployee.js';
import { Employee } from '../../services/employee.js';
import { IBranch } from '../../interfaces/IBranch.js';

@Component({
  selector: 'app-view-project-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, HasPermissionDirective],
  templateUrl: './view-project-modal.html',
  styleUrls: ['./view-project-modal.scss', '../../../styles.scss']
})
export class ViewProjectModal {
  project = signal<IProject | null>(null);
  @Output() update = new EventEmitter<IProject>();
  @Output() closed = new EventEmitter<void>();
  isOpen = signal(false);
  editMode = signal(false);
  departments = signal<IDepartment[]>([]);
  branchs = signal<IBranch[]>([]);
  employees = signal<IEmployee[]>([]);
  terms = signal<ITerm[]>([]);
  updatedName: string = '';
  updatedTotalBudget: number = 0;
  updatedWorkers: IEmployee[] = [];
  updatedManagers: IEmployee[] = [];
  updatedBranch: string = '';
  newAttachments: File[] = [];
  currentAttachments = signal<string[]>([]);
  newDocument: File[] = [];
  currentDocument = signal<string[]>([]);

  constructor(private branchService: Branch, private departmentService: Department, private employeeService: Employee) {}

  open(project: IProject) {
    this.project.set({ ...project });
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
        this.employeeService.getEmployeesByBranch(branchName).subscribe((res: any) => {
          this.employees.set(res.employees);
          this.employees.set(this.employees().filter(emp => {
            return !this.project()?.managers?.some(m => m.id === emp.id) && !this.project()?.workers?.some(w => w.id === emp.id);
          }));
        });
      }
    });
  }

  resetAll() {
    const p = this.project();  // cache value
    this.updatedName = p?.name ?? '';
    this.updatedBranch = p?.tenantId ?? '';
    this.updatedTotalBudget = p?.totalBudget ?? 0;
    this.updatedWorkers = [...(p?.workers ?? [])];
    this.updatedManagers = [...(p?.managers ?? [])];
    this.newAttachments = [];
    this.newDocument = [];
    this.terms.set([...(p?.terms ?? [])]);
    this.currentAttachments.set(this.attachments);
    this.currentDocument.set(this.documents);
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
    if (this.project()) {
      this.resetAll();
    }
    this.editMode.set(false);
  }

  addTerm() {
    this.terms.set([
      ...this.terms(),
      { title: '', description: '', budget: 0 }
    ]);
  }

  removeTerm(index: number) {
    this.terms.set(this.terms().filter((_, i) => i !== index));
  }

  // Separate methods to split attachment and document string to array of strings
  get attachments(): string[] {
    return this.project()?.attachments?.split(/,(?=\/uploads\/center\/)/) ?? [];
  }

  get documents(): string[] {
    return this.project()?.document?.split(/,(?=\/uploads\/center\/)/) ?? [];
  }

  removeNewAttachment(index: number) {
    this.newAttachments.splice(index, 1);
  }

  removeNewDocument(index: number) {
    this.newDocument.splice(index, 1);
  }

  removeCurrentAttachment(index: number) {
    this.currentAttachments.set(this.currentAttachments().filter((_, i) => i !== index));
  }

  removeCurrentDocument(index: number) {
    this.currentDocument.set(this.currentDocument().filter((_, i) => i !== index));
  }

  handleAttachmentInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.newAttachments = [...input.files];
    }
    input.value = ''; // reset input field
  }

  handleDocumentInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.newDocument = [...input.files];
    }
    input.value = ''; // reset input field
  }

  onWorkerToggle(event: Event, worker: IEmployee) {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      if (!this.project()?.workers?.includes(worker)) {
        // Add to selected workers
        this.project()?.workers?.push(worker);
        // Remove from employees list to avoid duplication
        this.employees.set(this.employees().filter(emp => emp.id !== worker.id));
      }
    } else {
      // Remove from selected workers
      this.project()!.workers = this.project()?.workers?.filter(w => w.id !== worker.id);
      // Add back to employees list
      this.employees.set([...this.employees(), worker]);
    }
  }

  onManagerToggle(event: Event, manager: IEmployee) {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      if (!this.project()?.managers?.includes(manager)) {
        // Add to selected managers
        this.project()?.managers?.push(manager);
        // Remove from employees list to avoid duplication
        this.employees.set(this.employees().filter(emp => emp.id !== manager.id));
      }
    } else {
      // Remove from selected managers
      this.project()!.managers = this.project()?.managers?.filter(m => m.id !== manager.id);
      // Add back to employees list
      this.employees.set([...this.employees(), manager]);
    }
  }

  saveChanges() {
    if (this.project) {
      if (this.terms()[this.terms().length - 1].title === '') {
        this.removeTerm(this.terms().length - 1);
      }
      const formData = new FormData();
      this.newAttachments.forEach(file => {
        formData.append('files', file);
      });
      const formDataDocument = new FormData();
      this.newDocument.forEach(file => {
        formDataDocument.append('files', file);
      });
      this.project()!.terms = this.terms();
      const newProject: any = {
        id: this.project()!.id,
        tenantId: this.updatedBranch ? this.updatedBranch : this.project()!.tenantId,
        name: this.updatedName ? this.updatedName : this.project()!.name,
        totalBudget: this.updatedTotalBudget ? this.updatedTotalBudget : this.project()!.totalBudget,
        workers: this.updatedWorkers ? this.updatedWorkers.map(w => w.id) : this.project()!.workers!.map(w => w.id),
        managers: this.updatedManagers ? this.updatedManagers.map(m => m.id) : this.project()!.managers!.map(m => m.id),
        terms: this.terms() ? this.terms() : this.project()!.terms,
        newAttachments: formData,
        newDocument: formDataDocument,
        currentAttachments: this.currentAttachments().join(','),
        currentDocument: this.currentDocument().join(',')
      };
      console.log('Saving project from modal:', newProject);
      this.update.emit(newProject);
      this.close();
    }
  }
}
