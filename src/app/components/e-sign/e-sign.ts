import { RoleService } from './../../services/role-service';
import { IRolePermission } from './../../interfaces/IRole';
import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { PaginationButton } from "../pagination-button/pagination-button";
import { User } from '../../services/user';
import { IRequest, status } from '../../interfaces/IRequest';
import { HasPermissionDirective } from '../../directives/has-permission';
import { Branch } from '../../services/branch';
import { IUser } from '../../interfaces/IUser';
import { ViewSignRequestModal } from '../view-sign-request-modal/view-sign-request-modal';
import { SignModal } from '../sign-modal/sign-modal';
import { SkeletonTable } from '../skeleton-table/skeleton-table';
import { IBranch } from '../../interfaces/IBranch';

@Component({
  selector: 'app-e-sign',
  standalone: true,
  imports: [TranslateModule, SkeletonTable, SignModal, ViewSignRequestModal, HasPermissionDirective, DatePipe, PaginationButton],
  templateUrl: './e-sign.html',
  styleUrls: ['./e-sign.scss', '../../../styles.scss']
})
export class ESign implements OnInit {
  @ViewChild(ViewSignRequestModal) viewModal!: ViewSignRequestModal;
  @ViewChild(SignModal) signModal!: SignModal;
  currentUser = signal<IUser | null>(null);
  currentPermissions = signal<IRolePermission[] | null>(null);
  requestsList = signal<any[]>([]);
  itemsPerPage = signal<number>(0);
  currentPage = signal<number>(1);
  currentTab = signal('docs');
  requestStatus = status;
  lastPageReached = signal(false);
  lastPage = signal(10000); // Set initial large number
  isLoading = signal<boolean>(true);
  branchFilter = signal<string>('all');
  branchList = signal<IBranch[]>([]);

  constructor(public userService: User, private branchService: Branch, private roleService: RoleService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab === 'archives') {
        this.currentTab.set('archives');
      } else {
        this.currentTab.set('docs');
      }
    });
    this.branchService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
      if (user) {
        this.roleService.getRoleById(user?.roleId!).subscribe((res: any) => {
          this.currentPermissions.set(res.role.permissions);
        });
        this.branchService.getAllBranches().subscribe((res: any) => {
          console.log('branches loaded', res);
          this.branchList.set(res.tenants);
        });
      }
      this.loadDocs();
    });
  }

  openViewRequestModal(request: IRequest) {
    this.viewModal.open(request);
  }

  loadDocs(page: number = 1) {
    this.isLoading.set(true);
    if (this.currentTab() === 'docs') {
      this.userService.getUnsignedDocs(page).subscribe((res: any) => {
        if (res.requestsToSign.length === 0 && page > 1) {
          this.loadDocs(page - 1);
          this.lastPageReached.set(true);
          this.lastPage.set(page - 1);
          this.isLoading.set(false);
          return;
        }
        if (page === this.lastPage()){
          this.lastPageReached.set(true);
        } else {
          this.lastPageReached.set(false);
        }
        this.requestsList.set(res.requestsToSign);
        this.currentPage.set(page);
        this.itemsPerPage.set(res.itemsPerPage ?? res.requestsToSign.length);
        this.isLoading.set(false);
      });
    }
    else{
      const user = this.currentUser();
      const perms = this.currentPermissions();
      if (!user) return;            // Prevent early load
      if (!perms) return;           // Wait until permissions arrive
      // Archives tab - Check permissions properly
      const canViewAll = perms.some(p =>
        p.permission.code === 'uploads:all' ||
        p.permission.code === 'admin:manage'
      );
      const canViewOwn = perms.some(p =>
        p.permission.code === 'uploads:own'
      );
      if (this.currentTab() === 'archives' && canViewAll) {
        if (this.branchFilter() !== 'all') {
          this.userService.getDocsByBranch(this.branchFilter()).subscribe((res: any) => {
            console.log('docs loaded filtered by branch', res);
            this.isLoading.set(false);
            this.requestsList.set(res.files);
          });
        } else {
          this.userService.getAllDocs().subscribe((res: any) => {
            console.log('docs loaded do not filter', res);
            this.isLoading.set(false);
            this.requestsList.set(res.files);
          });
        }
        return;
      }
      if (this.currentTab() === 'archives' && canViewOwn) {
        this.userService.getMyDocs().subscribe((res: any) => {
          this.isLoading.set(false);
          this.requestsList.set(res.files);
        });
      }
    }
  }

  changeTab(tab: string) {
    this.currentTab.set(tab);
    this.loadDocs(1);
  }

  openSignModal(request: IRequest) {
    this.signModal.open(request);
  }

}
