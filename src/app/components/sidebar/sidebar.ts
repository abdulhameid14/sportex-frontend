import { Component, EventEmitter, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from '../../services/translation';
import { HasPermissionDirective } from '../../directives/has-permission';
import { HasAnyPermissionDirective } from '../../directives/hasAnyPermission';
import { Branch } from '../../services/branch';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, TranslateModule, HasPermissionDirective, HasAnyPermissionDirective],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  @Output() isSidebarClicked = new EventEmitter<void>();

  currentModules: string[] = [];
  routeModuleMap: Record<string, string[]> = {
    tasks: ['tasks'],
    requests: ['requests', 'request_types'],
    reports: ['financial_reports'],
    esign: ['sign', 'my_archives', 'all_archives', 'archived_data'],
    chat: ['chat'],
    hr: ['players', 'players_performance'],
    finance: ['financial_reports'],
    strategy: ['strategies'],
    recruitment: ['player_scout'],
    announcement: ['announcements'],
    notifications: ['send_notification', 'notification'],
    departments: ['departments'],
    projects: ['projects'],
    'external-reports': ['external_reports'],
    meeting: ['meetings'],
    settings: ['settings'],
    jisr: ['meetings']
  };

  constructor(public translation: TranslationService, private branchService: Branch) {
    this.branchService.currentBranchModules$.subscribe(modules => {
      this.currentModules = modules || [];
    });
  }

  toggleSidebar(){
    this.isSidebarClicked.emit();
  }

  isModuleVisible(routeKey: string): boolean {
    if (!this.currentModules.length) {
      return true;
    }
    const moduleKeys = this.routeModuleMap[routeKey] || [];
    if (!moduleKeys.length) {
      return false;
    }
    return moduleKeys.some(key => this.currentModules.includes(key));
  }
}
