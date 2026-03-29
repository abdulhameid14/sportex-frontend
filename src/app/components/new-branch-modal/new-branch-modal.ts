import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IBranch } from '../../interfaces/IBranch';
import { User } from '../../services/user';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-new-branch-modal',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './new-branch-modal.html',
  styleUrls: ['./new-branch-modal.scss', '../../../styles.scss'],
  standalone: true
})
export class NewBranchModal {
  isOpen = signal(false);
  @Output() save = new EventEmitter<IBranch>();
  logoFile: File | null = null;
  selectedModules: string[] = [];

  availableModules = [
    { key: 'players', label: 'Players' },
    { key: 'financial_reports', label: 'Financial Reports' },
    { key: 'requests', label: 'Requests' },
    { key: 'roles', label: 'Roles' },
    { key: 'request_types', label: 'Request Types' },
    { key: 'player_scout', label: 'Player Scout' },
    { key: 'players_performance', label: "Player's Performance" },
    { key: 'strategies', label: 'Strategies' },
    { key: 'chat', label: 'Chat' },
    { key: 'announcements', label: 'Announcements' },
    { key: 'send_notification', label: 'Send Notification' },
    { key: 'notification', label: 'Notification' },
    { key: 'meetings', label: 'Meetings' },
    { key: 'sign', label: 'Sign' },
    { key: 'settings', label: 'Settings' },
    { key: 'my_archives', label: 'My Archives' },
    { key: 'all_archives', label: 'All Archives' },
    { key: 'archived_data', label: 'Archived Data' },
    { key: 'my_profile', label: 'My Profile' }
  ];

  constructor(private userService: User, private toast: ToastService) { }

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  handleLogoInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.logoFile = input.files[0];
    }
    input.value = '';
  }

  toggleModule(moduleKey: string) {
    const index = this.selectedModules.indexOf(moduleKey);
    if (index >= 0) {
      this.selectedModules.splice(index, 1);
    } else {
      this.selectedModules.push(moduleKey);
    }
  }

  isSelected(moduleKey: string): boolean {
    return this.selectedModules.includes(moduleKey);
  }

  submit(form: NgForm) {
    if (form.valid && this.selectedModules.length) {
      const proceedWithCreate = (logoLink?: string) => {
        const newBranch: any = {
          name: form.value.name,
          modules: [...this.selectedModules]
        };
        if (logoLink) newBranch.logo = logoLink;
        this.save.emit(newBranch);
        this.close();
        form.resetForm();
        this.logoFile = null;
        this.selectedModules = [];
      };

      if (this.logoFile) {
        const up = new FormData();
        up.append('files', this.logoFile);
        this.userService.uploadFiles(up).subscribe({
          next: (uploadRes: any) => {
            const links = uploadRes.links || [];
            const link = Array.isArray(links) && links.length ? links[0] : links;
            proceedWithCreate(typeof link === 'string' ? link : undefined);
          },
          error: (err: any) => {
            console.error('Logo upload error: ', err);
            this.toast.show('Error uploading logo', 'error');
            proceedWithCreate();
          }
        });
      } else {
        proceedWithCreate();
      }
    }
  }
}



