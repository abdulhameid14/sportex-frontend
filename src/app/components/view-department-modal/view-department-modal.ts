import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IDepartment } from '../../interfaces/IDepartment.js';
import { Subscription } from 'rxjs';
import { Branch } from '../../services/branch.js';
import { Department } from '../../services/department.js';
import { HasPermissionDirective } from '../../directives/has-permission.js';
import { Employee } from '../../services/employee.js';
import { IEmployee } from '../../interfaces/IEmployee.js';

@Component({
  selector: 'app-view-department-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, HasPermissionDirective],
  templateUrl: './view-department-modal.html',
  styleUrls: ['./view-department-modal.scss', '../../../styles.scss']
})
export class ViewDepartmentModal {
  department = signal<IDepartment | null>(null);
  @Output() update = new EventEmitter<IDepartment>();
  @Output() closed = new EventEmitter<void>();
  private departmentOriginal!: IDepartment;
  isOpen = signal(false);
  editMode = signal(false);
  departments = signal<IDepartment[]>([]);
  employees = signal<IEmployee[]>([]);
  private branchSub?: Subscription;

  constructor(private branchService: Branch, private departmentService: Department, private empService: Employee) {
  }

  open(department: IDepartment) {
    console.log('Fetching department details for ID:', department.id);
    this.departmentService.getDepartmentById(department.id!).subscribe((res: any) => {
      this.department.set(res.department);
      this.departmentOriginal = { ...res.department };
      console.log('Opening view branch modal for branch:', this.department);
      this.isOpen.set(true);
      this.editMode.set(false);
      this.branchSub = this.branchService.currentBranch$.subscribe(branchName => {
        if (branchName) {
          this.departmentService.getDepartmentsByBranch(branchName).subscribe((res: any) => {
            this.departments.set(res.departments);
          });
          this.empService.getEmployeesByBranch(branchName).subscribe((res: any) => {
            this.employees.set(res.employees);
          });
          // Unsubscribe after loading once
          this.branchSub?.unsubscribe();
        }
      });
    });
  }

  close() {
    this.isOpen.set(false);
    this.closed.emit();
  }

  enableEdit() {
    this.editMode.set(true);
  }

  cancelChanges() {
    if (this.departmentOriginal) {
      this.department.set(this.departmentOriginal);
    }
    this.editMode.set(false);
  }

  saveChanges() {
    if (this.department()) {
      console.log('Saving department from modal:', this.department());
      this.update.emit(this.department()!);
      this.close();
    }
  }
}
