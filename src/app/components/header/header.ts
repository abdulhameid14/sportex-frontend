import { Location } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ViewChild, signal } from '@angular/core';
import { LogoutModal } from './../logout-modal/logout-modal';
import { Notification } from './../notification/notification';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { User } from '../../services/user';
import { Auth } from '../../services/auth';
import { IBranch } from '../../interfaces/IBranch';
import { Branch } from '../../services/branch';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, FormsModule, LogoutModal, Notification,],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  searchQuery: string = '';
  userName = signal<string>('');
  notificationCount: number = 0;
  @Output() toggleSidebar = new EventEmitter<void>();
  @ViewChild(LogoutModal) logoutModal!: LogoutModal;
  @ViewChild(Notification) notification!: Notification;
  branches = signal<IBranch[]>([]);
  currentBranch = signal<string>('');

  constructor(
    private userService: User,
    private authService: Auth,
    private branchService: Branch,
    private location: Location
  ) { }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.userService.getCurrentUser().subscribe((res: any) => {
        this.userName.set(res.user.employee?.name);
      });
      this.branchService.getAllBranches().subscribe((res: any) => {
        this.branches.set(res.tenants);
      });
      this.branchService.currentBranch$.subscribe((branchName: string) => {
        this.currentBranch.set(branchName);
      });
    }
  }
  onSearch(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  console.log('Search:', value);
}

  openLogoutModal() {
    this.logoutModal.open();
  }

  toggleNotification() {
    if (this.notification.isOpen()) {
      this.notification.close();
    } else {
      this.notification.open();
      this.notificationCount = 0;
    }
  }

  updateNotificationCount(count: number) {
    this.notificationCount = count;
  }

  onBranchChange(event: any) {
    const branchName = event.target.value;
    this.branchService.setCurrentBranchByName(branchName);
  }

  goBack() {
    this.location.back();
  }
}
