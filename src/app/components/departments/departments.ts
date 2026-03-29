import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { DeleteValidationModal } from './../delete-validation-modal/delete-validation-modal';
import { NewDepartmentModal } from './../new-department-modal/new-department-modal';
import { ViewDepartmentModal } from '../view-department-modal/view-department-modal';
import { Department } from './../../services/department';
import { IDepartment } from '../../interfaces/IDepartment';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationButton } from "../pagination-button/pagination-button";
import { Branch } from '../../services/branch';
import { HasPermissionDirective } from '../../directives/has-permission';
import { HasAnyPermissionDirective } from '../../directives/hasAnyPermission';
import { SkeletonTable } from '../skeleton-table/skeleton-table';
import { Toast } from '../toast/toast';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-departments',
  imports: [NewDepartmentModal, Toast, SkeletonTable, HasAnyPermissionDirective, HasPermissionDirective, ViewDepartmentModal, DeleteValidationModal, TranslateModule, PaginationButton],
  templateUrl: './departments.html',
  styleUrls: ['./departments.scss', '../../../styles.scss']
})
export class Departments implements OnInit {
  isLoading = signal<boolean>(true);
  departmentsList = signal<IDepartment[]>([]);
  @ViewChild(NewDepartmentModal) departmentModal!: NewDepartmentModal;
  @ViewChild(ViewDepartmentModal) viewModal!: ViewDepartmentModal;
  @ViewChild(DeleteValidationModal) deleteModal!: DeleteValidationModal;
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(0);
  currentBranch = signal<string>('');
  lastPageReached = signal(false);
  lastPage = signal(10000); // Set initial large number

  constructor(private departmentService: Department, private branchService: Branch, private toast: ToastService) {}

  ngOnInit() {
    this.branchService.currentBranch$.subscribe(branch => {
      this.currentBranch.set(branch);
      this.loadDepartments(1, branch);
    });
  }

  loadDepartments(page: number, branchName: string = this.currentBranch()) {
    this.isLoading.set(true);
    this.departmentService.getDepartments(page, branchName).subscribe((res: any) => {
      if (res.departments.length === 0 && page > 1) {
        this.loadDepartments(page - 1, branchName);
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
      this.departmentsList.set(res.departments);
      this.itemsPerPage.set(res.departments.length);
      this.currentPage.set(page);
      this.isLoading.set(false);
    });
  }

  openNewDepartmentModal() {
    this.departmentModal.open();
  }

  openViewDepartmentModal(department: IDepartment) {
    this.viewModal.open(department);
  }

  updateDepartment(department: IDepartment) {
    this.departmentService.updateDepartment(department.id!, department).subscribe((res: any) => {
      this.departmentsList.update(list => list.map(item => (item.id === department.id ? { ...department } : item)));
      this.toast.show('Department updated successfully', 'success');
    });
  }

  saveNewDepartment(submitedDepartment: any) {
    const newDepartment: IDepartment = {
      name: submitedDepartment.name,
      tenantId: submitedDepartment.tenantId,
    };
    this.departmentService.createDepartment(newDepartment).subscribe((res: any) => {
      this.departmentsList.update(list => [submitedDepartment, ...list]);
      this.toast.show('Department created successfully', 'success');
    });
  }

  deleteDepartment(departmentId: string | undefined){
    if (!departmentId) {
      // Remove first element in taskList
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res){
          this.departmentsList.update(list => list.slice(1));
          this.toast.show('Department deleted successfully', 'success');
        }
      });
    }
    else {
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res){
          this.departmentService.deleteDepartment(departmentId).subscribe(() => {
            this.departmentsList.update(list => list.filter(department => department.id !== departmentId));
            this.toast.show('Department deleted successfully', 'success');
          });
        }
      });
    }
  }

}
