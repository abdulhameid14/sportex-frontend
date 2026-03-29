// has-permission.directive.ts
import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { PermissionService } from './../services/permissions';

@Directive({
  selector: '[hasAnyPermission]',
  standalone: true
})
export class HasAnyPermissionDirective {
  private permissionService = inject(PermissionService);
  private vcr = inject(ViewContainerRef);
  private tpl = inject(TemplateRef<any>);

  // Accept an array of permissions
  hasAnyPermission = input.required<string[]>();

  constructor() {
    effect(() => {
      const codes = this.hasAnyPermission();
      const hasPerm = this.permissionService.hasAny(...codes)();

      this.vcr.clear();
      if (hasPerm) {
        this.vcr.createEmbeddedView(this.tpl);
      }
    });
  }
}
