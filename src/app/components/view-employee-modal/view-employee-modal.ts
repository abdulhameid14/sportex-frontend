import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IDepartment } from '../../interfaces/IDepartment.js';
import { Branch } from '../../services/branch.js';
import { Department } from '../../services/department.js';
import { IEmployee } from '../../interfaces/IEmployee.js';
import { Employee } from '../../services/employee.js';
import { HasPermissionDirective } from '../../directives/has-permission.js';
import { IUserPerformance } from '../../interfaces/IUserPerformance.js';
import { IBranch } from '../../interfaces/IBranch.js';
import { IRole } from '../../interfaces/IRole.js';
import { RoleService } from '../../services/role-service.js';

@Component({
  selector: 'app-view-employee-modal',
  standalone: true,
  imports: [CommonModule, NgIf, FormsModule, TranslateModule, HasPermissionDirective],
  templateUrl: './view-employee-modal.html',
  styleUrls: ['./view-employee-modal.scss', '../../../styles.scss']
})
export class ViewEmployeeModal {
  employee = signal<IEmployee | null>(null);
  @Output() update = new EventEmitter<IEmployee>();
  @Output() closed = new EventEmitter<void>();
  isOpen = signal(false);
  editMode = signal(false);
  branchs = signal<IBranch[]>([]);
  departments = signal<IDepartment[]>([]);
  roleList = signal<IRole[]>([]);
  updatedName: string = '';
  updatedDepartmentId: string = '';
  updatedPosition: string = '';
  updatedSalary: number = 0;
  updatedVacation: number = 0
  updatedPhone: string = '';
  updatedBranch: string = '';
  updatedReviews = signal<IUserPerformance[]>([]);
  passwordVisible: boolean = false;
  updatedEmail: string = '';
  updatedPassword: string = '';
  updatedNationalId: string = '';
  updatedRoleId: string = '';

  constructor(private branchService: Branch, private departmentService: Department, private empService: Employee, private roleService: RoleService) {
  }

  open(employee: IEmployee) {
    console.log("Opening view employee modal for employee: ", employee);
    this.isOpen.set(true);
    this.editMode.set(false);
    this.empService.getEmployeeById(employee.id!).subscribe((res: any) => {
      this.employee.set(res.employee);
      this.updatedReviews.set(res.employee.userPerformance || []);
      this.resetAll();
      console.log("employee data: ", res.employee);
    });
    this.branchService.currentBranch$.subscribe(branchName => {
      if (branchName) {
        this.departmentService.getDepartmentsByBranch(branchName).subscribe((res: any) => {
          this.departments.set(res.departments);
        });
        this.branchService.getAllBranches().subscribe((res: any) => {
          this.branchs.set(res.tenants);
        });
        this.roleService.getAllRoles(branchName).subscribe((res: any) => {
          this.roleList.set(res.roles);
        });
      }
    });
  }

  resetAll(){
    this.updatedName = this.employee()?.name || '';
    this.updatedDepartmentId = this.employee()?.departmentId || '';
    this.updatedPosition = this.employee()?.position || '';
    this.updatedSalary = this.employee()?.salary || 0;
    this.updatedVacation = this.employee()?.vacations || 0;
    this.updatedPhone = this.employee()?.phone || '';
    this.updatedBranch = this.employee()?.tenantId || '';
    this.updatedReviews.set(this.employee()?.userPerformance || []);
    this.updatedEmail = this.employee()?.user?.email || '';
    this.updatedPassword = '';
    this.updatedNationalId = this.employee()?.user?.nationalId || '';
    this.updatedRoleId = this.employee()?.user?.roleId || '';
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

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  getRatingName(rating: number | undefined): string {
    switch (rating) {
      case 1: return 'Needs Improvement';
      case 2: return 'Average';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Unknown';
    }
  }

  deleteReview(reviewId: string) {
    if (this.employee()) {
      console.log('Deleting review with ID:', reviewId);
      this.updatedReviews.set(this.updatedReviews().filter(review => review.id !== reviewId));
    }
  }

  get deletedReviews(): IUserPerformance[] {
    if (!this.employee()) return [];
    const originalReviews = this.employee()!.userPerformance || [];
    return originalReviews.filter(originalReview =>
      !this.updatedReviews().some(updatedReview => updatedReview.id === originalReview.id)
    );
  }

  saveChanges() {
    if (this.employee()) {
      if (this.updatedEmail === this.employee()?.user!.email) {
        this.updatedEmail = '';
      }
      const newEmployee: any = {
        id: this.employee()?.id,
        tenantId: this.updatedBranch,
        name: this.updatedName,
        departmentId: this.updatedDepartmentId,
        position: this.updatedPosition,
        salary: this.updatedSalary,
        vacations: this.updatedVacation,
        phone: this.updatedPhone,
        deletedReviews: this.deletedReviews,
        user: {
          id: this.employee()?.user!.id,
          email: this.updatedEmail,
          password: this.updatedPassword,
          nationalId: this.updatedNationalId,
          roleId: this.updatedRoleId,
        }
      };
      console.log('new Employee from modal:', newEmployee);
      this.update.emit(newEmployee);
      this.close();
    }
  }
}
