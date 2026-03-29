import { Component, EventEmitter, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IRole, IPermission } from '../../interfaces/IRole';
import { RoleService } from '../../services/role-service';
import { Branch } from '../../services/branch';

@Component({
  selector: 'app-new-role-modal',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './new-role-modal.html',
  styleUrls: ['./new-role-modal.scss', '../../../styles.scss'],
  standalone: true
})
export class NewRoleModal {
  isOpen = signal(false);
  @Output() save = new EventEmitter<IRole>();
  permsList = signal<IPermission[]>([]);
  currentBranch = signal<string>('');
  selectedPermissions: IPermission[] = [];
  Object = Object;

  constructor(private roleService: RoleService, private branchService: Branch) {}

  open() {
    this.isOpen.set(true);
    this.branchService.currentBranch$.subscribe(branchName => {
      if (branchName) {
        this.currentBranch.set(branchName);
        this.roleService.getPermissions().subscribe((res: any) => {
          this.permsList.set(res.permissions);
        });
      }
    });
  }

  close() {
    this.isOpen.set(false);
    this.selectedPermissions = [];
  }

  adminPermission = computed(() => this.permsList().find(p => p.code === 'admin:manage'));

  groupedPermissions = computed(() => {
    const perms = this.permsList();
    const grouped: Record<string, IPermission[]> = {};
    perms.forEach(perm => {
      const module = perm.code.split(':')[0];
      if (!grouped[module]) grouped[module] = [];
      grouped[module].push(perm);
    });
    return grouped;
  });

  moduleKeys = computed(() => Object.keys(this.groupedPermissions()));

  isAdminSelected() {
    return this.selectedPermissions.some(p => p.code === 'admin:manage');
  }

  isPermissionSelected(perm: IPermission) {
    return this.selectedPermissions.some(p => p.id === perm.id);
  }

  isCheckboxDisabled(perm: IPermission) {
    return this.isAdminSelected() && perm.code !== 'admin:manage';
  }

  onPermissionToggle(event: Event, perm: IPermission) {
    const input = event.target as HTMLInputElement;

    if (input.checked) {
      if (perm.code === 'admin:manage') {
        this.selectedPermissions = [perm];
      } else {
        if (!this.isAdminSelected() && !this.selectedPermissions.includes(perm)) {
          this.selectedPermissions.push(perm);
        }
      }
    } else {
      this.selectedPermissions = this.selectedPermissions.filter(p => p.id !== perm.id);
    }
  }

  submit(form: NgForm) {
    if (form.valid) {
      const newRole: any = {
        tenantId: this.currentBranch(),
        name: form.value.name,
        permissionIds: this.selectedPermissions.map(p => p.id)
      };
      this.save.emit(newRole);
      this.close();
      form.resetForm();
      this.selectedPermissions = [];
    }
  }
}
