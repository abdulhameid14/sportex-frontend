import { Component, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IDepartment } from '../../interfaces/IDepartment.js';
import { Branch } from '../../services/branch.js';
import { Department } from '../../services/department.js';
import { IPermission, IRole } from '../../interfaces/IRole.js';
import { HasPermissionDirective } from '../../directives/has-permission.js';
import { RoleService } from '../../services/role-service.js';

@Component({
  selector: 'app-view-role-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, HasPermissionDirective],
  templateUrl: './view-role-modal.html',
  styleUrls: ['./view-role-modal.scss', '../../../styles.scss']
})
export class ViewRoleModal {
  role = signal<IRole | null>(null);
  @Output() update = new EventEmitter<IRole>();
  @Output() closed = new EventEmitter<void>();
  isOpen = signal(false);
  editMode = signal(false);
  departments = signal<IDepartment[]>([]);
  permissions = signal<IPermission[]>([]);
  selectedPermissions: IPermission[] = [];
  Object = Object;

  constructor(private branchService: Branch, private departmentService: Department, private roleService: RoleService) {
  }

  open(role: IRole) {
    console.log('Opening view role modal for role:', role);
    this.role.set({ ...role });
    // PRE-SELECT existing permissions
    this.selectedPermissions = role.permissions ? role.permissions.map(p => p.permission) : [];
    this.isOpen.set(true);
    this.editMode.set(false);
    this.branchService.currentBranch$.subscribe(branchName => {
      if (branchName) {
        this.departmentService.getDepartmentsByBranch(branchName).subscribe((res: any) => {
          this.departments.set(res.departments);
        });
        this.roleService.getPermissions().subscribe((res: any) => {
          this.permissions.set(res.permissions);
        });
      }
    });
  }

  close() {
    this.isOpen.set(false);
    this.selectedPermissions = [];
    this.closed.emit();
  }

  enableEdit() {
    this.editMode.set(true);
  }

  cancelChanges() {
    if (this.role()) {
      this.selectedPermissions = [];
    }
    this.editMode.set(false);
  }

/*   onPermissionToggle(event: Event, perm: IPermission) {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      if (!this.selectedPermissions.includes(perm)) {
        this.selectedPermissions.push(perm);
      }
    } else {
      this.selectedPermissions = this.selectedPermissions.filter(p => p.id !== perm.id);
    }
  } */

  onPermissionToggle(event: Event, perm: IPermission) {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      // If admin is checked, clear all other permissions
      if (perm.code === 'admin:manage') {
        this.selectedPermissions = [perm];
      } else {
        // Only add non-admin permission if admin isn't selected
        if (!this.isAdminSelected() && !this.selectedPermissions.includes(perm)) {
          this.selectedPermissions.push(perm);
        }
      }
    } else {
      // Uncheck admin or other permissions normally
      this.selectedPermissions = this.selectedPermissions.filter(p => p.id !== perm.id);
    }
  }

  isPermissionSelected(perm: IPermission): boolean {
    if (!this.selectedPermissions) return false;
    return this.selectedPermissions.some(p => p.id === perm.id);
  }

  isAdminSelected() {
    return this.selectedPermissions.some(p => p.code === 'admin:manage');
  }

  isCheckboxDisabled(perm: IPermission) {
    // Disable all others if admin is selected, except admin itself
    return this.isAdminSelected() && perm.code !== 'admin:manage';
  }

  // Grouped permissions by module for easier display
  groupedPermissions = computed(() => {
    const perms = this.permissions();
    const grouped: Record<string, IPermission[]> = {};
    perms.forEach((perm) => {
      const module = perm.code.split(':')[0];
      if (!grouped[module]) grouped[module] = [];
      grouped[module].push(perm);
    });
    return grouped;
  });

  adminPermission = computed(() => this.permissions().find(p => p.code === 'admin:manage'));

  saveChanges() {
    if (this.role()) {
      const updatedRole: any = {
        roleId: this.role()!.id,
        permissionIds: this.selectedPermissions.map(p => p.id)
      };
      console.log('Saving role from modal:', updatedRole);
      this.update.emit(updatedRole);
      this.close();
      this.selectedPermissions = [];
    }
  }
}
