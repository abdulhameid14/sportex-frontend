import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { PermissionService } from './../services/permissions';

export const permissionGuard: CanActivateFn = (route) => {
  const permService = inject(PermissionService);
  const router = inject(Router);

  const required = route.data?.['permission'];

  let allowed = false;

  // Case 1: Single permission string
  if (typeof required === 'string') {
    allowed = permService.hasPermission(required)();
  }

  // Case 2: Array of permissions → requires ANY of them
  else if (Array.isArray(required)) {
    allowed = permService.hasAny(...required)();
  }

  if (allowed) return true;

  router.navigateByUrl('/unauthorized');
  return false;
};
