import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { PermissionService } from './../services/permissions';

@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private permissionService = inject(PermissionService);
  private vcr = inject(ViewContainerRef);
  private tpl = inject(TemplateRef<any>);

  // 👇 Important: the input name must match the directive selector
  hasPermission = input.required<string>();

  constructor() {
    effect(() => {
      const permCode = this.hasPermission();
      const hasPerm = this.permissionService.hasPermission(permCode)();

      this.vcr.clear();
      if (hasPerm) {
        this.vcr.createEmbeddedView(this.tpl);
      }
    });
  }
}
