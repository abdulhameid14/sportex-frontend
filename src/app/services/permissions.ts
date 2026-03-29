import { Injectable, signal, computed } from '@angular/core';
import { IRolePermission } from '../interfaces/IRole';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private _permissions = signal<IRolePermission[]>([]);

  // Set user permissions once the user login
  setPermissions(permissions: IRolePermission[]) {
    this._permissions.set(permissions);
  }

  // Check if the user has a specific permission
  hasPermission = (code: string) =>
    computed(() => this._permissions().some(perm => perm.permission.code === code) || this._permissions().some(perm => perm.permission.code === 'admin:manage'));

  // Check if user has any of a list of permissions
  hasAny = (...codes: string[]) =>
    computed(() => codes.some(code => this._permissions().some(perm => perm.permission.code === code) || this._permissions().some(perm => perm.permission.code === 'admin:manage')));
}
