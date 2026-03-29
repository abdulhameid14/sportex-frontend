import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { DeleteValidationModal } from './../delete-validation-modal/delete-validation-modal';
import { NewBranchModal } from './../new-branch-modal/new-branch-modal';
import { ViewBranchModal } from '../view-branch-modal/view-branch-modal';
import { Branch } from '../../services/branch';
import { TranslateModule } from '@ngx-translate/core';
import { IBranch } from '../../interfaces/IBranch';
import { DatePipe } from '@angular/common';
import { PaginationButton } from "../pagination-button/pagination-button";
import { SkeletonTable } from '../skeleton-table/skeleton-table';
import { Toast } from '../toast/toast';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-branches',
  imports: [NewBranchModal, Toast, SkeletonTable, ViewBranchModal, DeleteValidationModal, TranslateModule, DatePipe, PaginationButton],
  templateUrl: './branches.html',
  styleUrls: ['./branches.scss', '../../../styles.scss']
})
export class Branches implements OnInit {
  apiUrl = signal<string>('');
  branchesList = signal<IBranch[]>([]);
  isLoading = signal<boolean>(true);
  @ViewChild(NewBranchModal) branchModal!: NewBranchModal;
  @ViewChild(ViewBranchModal) viewModal!: ViewBranchModal;
  @ViewChild(DeleteValidationModal) deleteModal!: DeleteValidationModal;
  itemsPerPage = signal<number>(0);
  currentPage = signal<number>(1)
  lastPageReached = signal(false);
  lastPage = signal(10000); // Set initial large number

  constructor(private branchService: Branch, private toast: ToastService) {
    this.apiUrl.set(this.branchService.apiUrl);
    this.apiUrl.set(this.apiUrl().replace('v1', ''));
  }

  ngOnInit() {
    this.loadBranches();
  }

  loadBranches(page: number = 1) {
    this.isLoading.set(true);
    this.branchService.getBranches(page).subscribe((res: any) => {
      if (res.tenants.length === 0 && page > 1) {
        this.loadBranches(page - 1);
        this.lastPageReached.set(true);
        this.lastPage.set(page - 1);
        this.isLoading.set(false);
        return;
      }
      if (page === this.lastPage()) {
        this.lastPageReached.set(true);
      } else {
        this.lastPageReached.set(false);
      }
      this.branchesList.set(res.tenants);
      this.currentPage.set(page);
      this.itemsPerPage.set(res.tenants.length);
      this.isLoading.set(false);
    });
  }

  openNewBranchModal() {
    this.branchModal.open();
  }

  openViewBranchModal(branch: IBranch) {
    this.viewModal.open(branch);
  }

  updateBranch(branch: IBranch) {
    this.branchService.updateBranch(branch.id!, branch).subscribe((res: any) => {
      this.toast.show('Branch updated successfully', 'success');
      this.branchesList.update(list => list.map(item => (item.id === branch.id ? { ...branch } : item)));
    });
  }

  saveNewBranch(submitedBranch: any) {
    const newBranch: IBranch = {
      name: submitedBranch.name
    };
    this.branchService.createBranch(newBranch).subscribe((res: any) => {
      this.toast.show('Branch created successfully', 'success');
      this.branchesList.update(list => [submitedBranch, ...list]);
    });
  }

  deleteBranch(branchId: string | undefined) {
    if (!branchId) {
      // Remove first element in taskList
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res) {
          this.toast.show('Branch deleted successfully', 'success');
          this.branchesList.update(list => list.slice(1));
        }
      });
    }
    else {
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res) {
          this.branchService.deleteBranch(branchId).subscribe(() => {
            this.toast.show('Branch deleted successfully', 'success');
            this.branchesList.update(list => list.filter(branch => branch.id !== branchId));
          });
        }
      });
    }
  }

}
