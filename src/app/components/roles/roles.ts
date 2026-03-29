import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { DeleteValidationModal } from './../delete-validation-modal/delete-validation-modal';
import { TranslateModule } from '@ngx-translate/core';
import { IRole } from '../../interfaces/IRole';
import { RoleService } from '../../services/role-service';
import { NewRoleModal } from '../new-role-modal/new-role-modal';
import { ViewRoleModal } from '../view-role-modal/view-role-modal';
import { PaginationButton } from "../pagination-button/pagination-button";
import { Branch } from '../../services/branch';
import { HasPermissionDirective } from '../../directives/has-permission';
import { Router } from '@angular/router';
import { SkeletonTable } from '../skeleton-table/skeleton-table';
import { Toast } from '../toast/toast';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-roles',
  imports: [ViewRoleModal, Toast, SkeletonTable, DeleteValidationModal, TranslateModule, NewRoleModal, PaginationButton, HasPermissionDirective],
  templateUrl: './roles.html',
  styleUrls: ['./roles.scss', '../../../styles.scss']
})
export class Roles implements OnInit {
  isLoading = signal<boolean>(true);
  rolesList = signal<IRole[]>([]);
  @ViewChild(NewRoleModal) roleModal!: NewRoleModal;
  @ViewChild(ViewRoleModal) viewModal!: ViewRoleModal;
  @ViewChild(DeleteValidationModal) deleteModal!: DeleteValidationModal;
  currentBranch = signal<string>('');
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(0);
  lastPageReached = signal(false);
  lastPage = signal(10000); // Set initial large number

  constructor(private roleService: RoleService, private branchService: Branch, private router: Router, private toast: ToastService) {}

  ngOnInit() {
    this.branchService.currentBranch$.subscribe(branch => {
      this.currentBranch.set(branch);
      this.loadRoles(1);
    });
  }

  loadRoles(page: number, branchName: string = this.currentBranch()) {
    this.isLoading.set(true);
    this.roleService.getRoles(page, branchName).subscribe((res: any) => {
      if (res.roles.length === 0 && page > 1) {
        this.loadRoles(page - 1, branchName);
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
      this.rolesList.set(res.roles);
      this.currentPage.set(page);
      this.itemsPerPage.set(res.roles.length);
      this.isLoading.set(false);
    });
  }

  openNewRoleModal() {
    this.roleModal.open();
  }

  openViewRoleModal(role: IRole) {
    this.viewModal.open(role);
  }

  saveNewRole(submitedRole: any) {
    const newRole: any = {
      name: submitedRole.name,
      tenantId: submitedRole.tenantId
    };
    this.roleService.createRole(newRole).subscribe({
      next: (res: any) => {
        this.rolesList.update(list => [res.role, ...list]);
        const assignmentPayload = {
          roleId: res.role.id,
          permissionIds: submitedRole.permissionIds
        };
        this.roleService.assignPermissionsToRole(assignmentPayload).subscribe({
          next: () => {
            this.toast.show('Role created successfully', 'success');
            // Force reload roles to reflect changes
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/settings']);
            });
          },
          error: (err) => {this.roleService.deleteRole(res.role.id).subscribe(() => {
              console.error('Error assigning permissions, role creation rolled back:', err);
            });
          }
        });
      },
      error: (err) => {
        console.error('Error creating role:', err);
      }
    });
  }

  updateRole(role: any) {
    console.log('Updating role from parent component:', role);
    this.roleService.assignPermissionsToRole(role).subscribe((res: any) => {
      this.toast.show('Role updated successfully', 'success');
      // Force reload roles to reflect changes
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/settings']);
      });
    });
  }

  deleteRole(roleId: string | undefined){
    if (!roleId) {
      // Remove first element in roleList
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res){
          this.rolesList.update(list => list.slice(1));
          this.toast.show('Role deleted successfully', 'success');
        }
      });
    }
    else{
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res){
          this.roleService.deleteRole(roleId).subscribe(() => {
            this.toast.show('Role deleted successfully', 'success');
            this.rolesList.update(list => list.filter(role => role.id !== roleId));
          });
        }
      });
    }
  }

}
