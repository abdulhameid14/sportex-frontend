import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DeleteValidationModal } from './../delete-validation-modal/delete-validation-modal';
import { ViewEmployeeModal } from '../view-employee-modal/view-employee-modal';
import { EmpPerformanceModal } from '../emp-performance-modal/emp-performance-modal';
import { IEmployee } from '../../interfaces/IEmployee';
import { IDepartment } from '../../interfaces/IDepartment';
import { Employee } from '../../services/employee';
import { Department } from '../../services/department.js';
import { PaginationButton } from "../pagination-button/pagination-button";
import { Branch } from '../../services/branch';
import { HasPermissionDirective } from '../../directives/has-permission';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { HasAnyPermissionDirective } from '../../directives/hasAnyPermission';
import { SkeletonTable } from '../skeleton-table/skeleton-table';
import { Toast } from '../toast/toast';
import { ToastService } from '../../services/toast';
import { User } from '../../services/user';

@Component({
  selector: 'app-hr',
  standalone: true,
  imports: [DeleteValidationModal, Toast, SkeletonTable, HasAnyPermissionDirective, HasPermissionDirective, ViewEmployeeModal, EmpPerformanceModal, TranslateModule, PaginationButton],
  templateUrl: './hr.html',
  styleUrls: ['./hr.scss', '../../../styles.scss']
})
export class Hr implements OnInit {
  isLoading = signal<boolean>(true);
  employeeList = signal<IEmployee[]>([]);
  departmentList = signal<IDepartment[]>([]);
  @ViewChild(DeleteValidationModal) deleteModal!: DeleteValidationModal;
  @ViewChild(ViewEmployeeModal) viewModal!: ViewEmployeeModal;
  @ViewChild(EmpPerformanceModal) performanceModal!: EmpPerformanceModal;
  email: string = 'ahmad@company.com';
  employeeCount: number = 200;
  newMonthEmployees: number = 2;
  attendanceCount: number = 150;
  attendanceRate: string = ((this.attendanceCount / (this.employeeCount)) * 100).toFixed(0);
  pendingLeaveCount: number = 5;
  expiredContractsCount: number = 3;
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(0);
  currentBranch = signal<string>('');
  lastPageReached = signal(false);
  lastPage = signal(10000); // Set initial large number
  departmentFilter = signal('ALL');

  constructor(private empService: Employee, private depService: Department, private branchService: Branch, private userService: User, private router: Router, private toast: ToastService) {}

  ngOnInit() {
    this.branchService.currentBranch$.subscribe(branch => {
      this.currentBranch.set(branch);
      this.loadEmployees(1);
      this.depService.getAllDepartments(branch).subscribe((res: any) => {
        this.departmentList.set(res.departments);
      });
    });
  }

  loadEmployees(page: number, branchName: string = this.currentBranch()) {
    this.isLoading.set(true);
    this.empService.getEmployees(page, branchName, this.departmentFilter()).subscribe((res: any) => {
      if (res.employees.length === 0 && page > 1) {
        this.loadEmployees(page - 1, branchName);
        this.lastPageReached.set(true);
        this.lastPage.set(page - 1);
        this.isLoading.set(false);
        return;
      }
      if (page === this.lastPage()){
        this.lastPageReached.set(true);
      } else {
        this.lastPageReached.set(false);
      }
      // Map employees and prepend API URL to photo
      const updatedEmployees = res.employees.map((emp: IEmployee) => ({
        ...emp,
        photo: emp.photo ? `https://api.kayanatdashboard.com/api${emp.photo}` : ''
      }));
      this.employeeList.set(updatedEmployees);
      console.log('Loaded Employees: ', res.employees);
      this.itemsPerPage.set(res.employees.length);
      this.currentPage.set(page);
      this.isLoading.set(false);
    });
  }

  openViewEmployeeModal(employee: IEmployee) {
    this.viewModal.open(employee);
  }

  openEmpPerformanceModal(employee: IEmployee) {
    this.performanceModal.open(employee);
  }

  updateEmployee(employee: any) {
    const empUpdate = {
      name: employee.name,
      tenantId: employee.tenantId,
      departmentId: employee.departmentId,
      position: employee.position,
      salary: employee.salary,
      vacations: employee.vacations,
      phone: employee.phone,
    };

    const userUpdate: any = {};
    if (employee.user.email !== null && employee.user.email !== '') {
      userUpdate.email = employee.user.email;
    }
    userUpdate.nationalId = employee.user.nationalId;
    userUpdate.roleId = employee.user.roleId;
    userUpdate.tenantId = employee.tenantId;
    if (employee.user.password !== null && employee.user.password !== '') {
      userUpdate.password = employee.user.password;
    }


    // Prepare requests
    const requests = [];

    // 1. Update employee info
    requests.push(this.empService.updateEmployee(employee.id!, empUpdate));

    // 2. Update user info
    requests.push(this.userService.updateUser(employee.user.id!, userUpdate));

    // Execute all requests together
    forkJoin(requests).subscribe(() => {
      this.toast.show('Employee updated successfully', 'success');
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/hr']);
      });
    });
  }

  deleteEmployee(empId: string | undefined) {
    if (!empId) {
      // Remove first element in taskList
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res){
          this.employeeList.update(list => list.slice(1));
          this.toast.show('Employee deleted successfully', 'success');
        }
      });
    }
    else {
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res){
          this.empService.deleteEmployee(empId).subscribe(() => {
            this.toast.show('Employee deleted successfully', 'success');
            this.employeeList.update(list => list.filter(emp => emp.id !== empId));
          });
        }
      });
    }
  }

}
