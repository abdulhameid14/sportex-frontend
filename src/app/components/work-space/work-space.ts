import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { NewBranchModal } from '../new-branch-modal/new-branch-modal';
import { Branch } from '../../services/branch';
import { IBranch } from '../../interfaces/IBranch';

@Component({
  selector: 'work-space',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule, NewBranchModal],
  templateUrl: './work-space.html',
  styleUrls: ['./work-space.scss']
})
export class WorkSpace implements OnInit, OnDestroy {
  branches: IBranch[] = [];
  isLoading = false;

  @ViewChild('branchModal') branchModal!: NewBranchModal;

  private moduleLabels: Record<string, string> = {
    players: 'HR Management',
    financial_reports: 'Finance',
    requests: 'Requests',
    roles: 'Roles',
    request_types: 'Requests',
    player_scout: 'Recruitment',
    players_performance: 'HR Management',
    strategies: 'Strategy',
    chat: 'Chat',
    announcements: 'Announcements',
    send_notification: 'Notifications',
    notification: 'Notifications',
    meetings: 'Meetings',
    sign: 'Sign',
    settings: 'Settings',
    my_archives: 'Sign',
    all_archives: 'Sign',
    archived_data: 'Sign',
    my_profile: 'Profile',
    tasks: 'Tasks',
    reports: 'Reports',
    projects: 'Projects',
    departments: 'Departments',
    external_reports: 'External Reports',
    branches: 'Branches',
    jisr: 'Jisr',
    dashboard: 'Dashboard'
  };

  constructor(
    private branchService: Branch,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    document.body.classList.add('workspace-route');
    this.loadBranches();
  }

  loadBranches() {
    this.isLoading = true;
    this.branchService.getAllBranches().subscribe({
      next: (res: any) => {
        this.zone.run(() => {
          this.branches = res?.tenants || res || [];
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.branches = [];
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  selectWorkspace(branch: IBranch) {
    const selectedModules = branch.enabledModuleKeys?.length ? branch.enabledModuleKeys : branch.modules || [];
    console.log('Selected branch:', branch.name, 'modules:', selectedModules);
    this.branchService.setCurrentBranch(branch);
    this.router.navigate(['/dashboard']);
  }

  createAdministration() {
    this.branchModal?.open();
  }

  saveNewBranch(submittedBranch: IBranch) {
    const branchToSave: any = {
      name: submittedBranch.name,
      logo: submittedBranch.logo || null,
      modules: submittedBranch.modules || []
    };

    this.branchService.createBranch(branchToSave).subscribe({
      next: (res: any) => {
        const createdBranch = res?.tenant || res;
        if (createdBranch) {
          this.branches = [createdBranch, ...this.branches];
          this.loadBranches();
        }
      }
    });
  }

  getModuleLabel(key: string) {
    return this.moduleLabels[key] || key;
  }

  ngOnDestroy() {
    document.body.classList.remove('workspace-route');
  }
}
