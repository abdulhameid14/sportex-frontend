import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IProject } from '../../interfaces/IProject';
import { Subscription } from 'rxjs';
import { IDepartment } from '../../interfaces/IDepartment';
import { Department } from '../../services/department';
import { Branch } from '../../services/branch';
import { Employee } from '../../services/employee';
import { IEmployee } from '../../interfaces/IEmployee';

@Component({
  selector: 'app-new-project-modal',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './new-project-modal.html',
  styleUrls: ['./new-project-modal.scss', '../../../styles.scss'],
  standalone: true
})
export class NewProjectModal {
  isOpen = signal(false);
  @Output() save = new EventEmitter<IProject>();
  attachments: File[] = [];
  document: File[] = [];
  currentBranch = signal<string>('');
  departments = signal<IDepartment[]>([]);
  employees = signal<IEmployee[]>([]);
  selectedManagers: IEmployee[] = [];
  selectedWorkers: IEmployee[] = [];
  private branchSub?: Subscription;
  terms: { title: string; description: string; budget?: number }[] = [];

  constructor(private branchService: Branch, private departmentService: Department, private employeeService: Employee) {
    this.terms.push({ title: '', description: '', budget: 0 });
  }

  open() {
    this.isOpen.set(true);
    this.branchSub = this.branchService.currentBranch$.subscribe(branchName => {
      if (branchName) {
        this.currentBranch.set(branchName);
        this.departmentService.getDepartmentsByBranch(branchName).subscribe((res: any) => {
          this.departments.set(res.departments);
        });
        this.employeeService.getEmployeesByBranch(branchName).subscribe((res: any) => {
          this.employees.set(res.employees);
        });
        // Unsubscribe after loading once
        this.branchSub?.unsubscribe();
      }
    });
  }

  close() {
    this.isOpen.set(false);
    this.attachments = [];
    this.document = [];
    this.terms = [{ title: '', description: '', budget: 0 }];
    this.selectedManagers = [];
    this.selectedWorkers = [];
  }

  addTerm() {
    this.terms.push({ title: '', description: '', budget: 0 });
  }

  removeTerm(index: number) {
    this.terms.splice(index, 1);
  }

  removeAttachment(index: number) {
    this.attachments.splice(index, 1);
  }

  removeDoc(index: number) {
    this.document.splice(index, 1);
  }

  onManagerToggle(event: Event, manager: IEmployee) {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      if (!this.selectedManagers.includes(manager)) {
        // Add to selected managers
        this.selectedManagers.push(manager);
        // Remove from employees list to avoid duplication
        this.employees.set(this.employees().filter(emp => emp.id !== manager.id));
      }
    } else {
      // Remove from selected managers
      this.selectedManagers = this.selectedManagers.filter(m => m.id !== manager.id);
      // Add back to employees list
      this.employees.set([...this.employees(), manager]);
    }
  }

  onWorkerToggle(event: Event, worker: IEmployee) {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      if (!this.selectedWorkers.includes(worker)) {
        // Add to selected workers
        this.selectedWorkers.push(worker);
        // Remove from employees list to avoid duplication
        this.employees.set(this.employees().filter(emp => emp.id !== worker.id));
      }
    } else {
      // Remove from selected workers
      this.selectedWorkers = this.selectedWorkers.filter(w => w.id !== worker.id);
      // Add back to employees list
      this.employees.set([...this.employees(), worker]);
    }
  }

  handleAttachmentInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.attachments = [...input.files];
    }
    input.value = ''; // reset input field
  }

  handleDocumentInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.document = [...input.files];
    }
    input.value = ''; // reset input field
  }

  submit(form: NgForm) {
    if (form.valid) {
      const formData = new FormData();
      this.attachments.forEach(file => {
        formData.append('files', file);
      });
      const formDataDocument = new FormData();
      this.document.forEach(file => {
        formDataDocument.append('files', file);
      });
      const newProject: any = {
        tenantId: this.currentBranch(),
        name: form.value.name,
        totalBudget: form.value.budget,
        document: formDataDocument,
        attachments: formData,
        // Send workers and managers IDs only
        workers: this.selectedWorkers.map(w => w.id),
        managers: this.selectedManagers.map(m => m.id),
        createdAt: new Date(),
        terms: this.terms.map(term => ({
          title: term.title,
          description: term.description,
          budget: term.budget
        })),
      };
      console.log('New Project Data from modal:', newProject);
      this.save.emit(newProject);
      this.close();
      form.resetForm();
      this.attachments = [];
      this.document = [];
      this.terms = [{ title: '', description: '', budget: 0 }]; // Reset terms
    }
  }

}
