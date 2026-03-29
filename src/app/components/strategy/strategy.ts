import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { DeleteValidationModal } from './../delete-validation-modal/delete-validation-modal';
import { NewStrategyModal } from './../new-strategy-modal/new-strategy-modal';
import { ViewStrategyModal } from './../view-strategy-modal/view-strategy-modal';
import { strategyService } from '../../services/strategy.js';
import { IStrategy } from '../../interfaces/IStrategy.js';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationButton } from "../pagination-button/pagination-button";
import { Branch } from '../../services/branch';
import { User } from '../../services/user';
import { HasPermissionDirective } from '../../directives/has-permission';
import { Router } from '@angular/router';
import { IUser } from '../../interfaces/IUser';
import { HasAnyPermissionDirective } from '../../directives/hasAnyPermission';
import { Toast } from '../toast/toast';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-strategy',
  standalone: true,
  imports: [NewStrategyModal, Toast, HasAnyPermissionDirective, ViewStrategyModal, DatePipe, DeleteValidationModal, TranslateModule, PaginationButton, HasPermissionDirective],
  templateUrl: './strategy.html',
  styleUrls: ['./strategy.scss', '../../../styles.scss']
})
export class Strategy implements OnInit {
  strategyList = signal<IStrategy[]>([]);
  @ViewChild(NewStrategyModal) strategyModal!: NewStrategyModal;
  @ViewChild(ViewStrategyModal) viewModal!: ViewStrategyModal;
  @ViewChild(DeleteValidationModal) deleteModal!: DeleteValidationModal;
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(0);
  currentBranch = signal<string>('');
  currentUser = signal<IUser | null>(null);
  lastPageReached = signal(false);
  lastPage = signal(10000); // Set initial large number

  constructor(private strategyService: strategyService, private toast: ToastService, private branchService: Branch, private userServ: User, private router: Router) {}

  ngOnInit() {
    this.branchService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
      this.currentBranch.set(user?.tenantId!);
      this.loadStrategies(1, this.currentBranch());
    });
  }

  loadStrategies(page: number, branchName: string = this.currentBranch()) {
    this.strategyService.getStrategies(page, branchName, this.currentUser()?.employee!.departmentId!).subscribe((res: any) => {
      if (res.strategies.length === 0 && page > 1) {
        this.loadStrategies(page - 1, branchName);
        this.lastPageReached.set(true);
        this.lastPage.set(page - 1);
        return;
      }
      if (page === this.lastPage()){
        this.lastPageReached.set(true);
      } else {
        this.lastPageReached.set(false);
      }
      this.strategyList.set(res.strategies);
      this.itemsPerPage.set(res.strategies.length);
      this.currentPage.set(page);
    });
  }

  openNewStrategyModal() {
    this.strategyModal.open();
  }

  openViewStrategyModal(strategy: IStrategy) {
    this.viewModal.open(strategy);
  }

  updateStrategy(submitedStrategy: any) {
    if (submitedStrategy.newAttachments.getAll('files').length === 0){
      const newStrategy: any = {
        tenantId: submitedStrategy.tenantId,
        title: submitedStrategy.title,
        departmentId: submitedStrategy.departmentId,
        description: submitedStrategy.description,
        goals: submitedStrategy.goals,
        budget: submitedStrategy.budget,
        active: submitedStrategy.active,
        attachments: submitedStrategy.currentAttachments
      };
      this.strategyService.updateStrategy(submitedStrategy.id!, newStrategy).subscribe((res: any) => {
        this.toast.show('Strategy updated successfully', 'success');
        // Force route reload
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/strategy']);
        });
      });
    }
    else {
      this.userServ.uploadFiles(submitedStrategy.newAttachments).subscribe({
        next: (uploadRes: any) => {
          const attachments = uploadRes.links;
          if (!Array.isArray(submitedStrategy.currentAttachments)) {
            submitedStrategy.currentAttachments = submitedStrategy.currentAttachments ? submitedStrategy.currentAttachments.split(/,(?=\/uploads\/center\/)/) : [];
          }
          submitedStrategy.currentAttachments = [
            ...submitedStrategy.currentAttachments,
            ...attachments
          ].join(',');
          const newStrategy: any = {
            tenantId: submitedStrategy.tenantId,
            title: submitedStrategy.title,
            departmentId: submitedStrategy.departmentId,
            description: submitedStrategy.description,
            goals: submitedStrategy.goals,
            budget: submitedStrategy.budget,
            active: submitedStrategy.active,
            attachments: submitedStrategy.currentAttachments
          };
          this.strategyService.updateStrategy(submitedStrategy.id!, newStrategy).subscribe((res: any) => {
            this.toast.show('Strategy updated successfully', 'success');
            // Force route reload
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/strategy']);
            });
          });
        },
        error: (err: any) => {
          console.error('Error uploading files: ', err);
        }
      });
    }
  }

  handleAttachmentsList(list: string[]): string {
    let attachments: string = '';
    for (let i = 0; i < list.length; i++) {
      attachments += list[i] + ',';
    }
    return attachments.slice(0, -1);
  }

  saveNewStrategy(submitedStrategy: any) {
    if (submitedStrategy.attachments.getAll('files').length === 0){
      const newStrategy: IStrategy = {
        tenantId: submitedStrategy.tenantId,
        title: submitedStrategy.title,
        departmentId: submitedStrategy.departmentId,
        description: submitedStrategy.description,
        goals: submitedStrategy.goals,
        budget: submitedStrategy.budget,
        active: submitedStrategy.active,
        attachments: ''
      };
      this.strategyService.createStrategy(newStrategy).subscribe((res: any) => {
        this.toast.show('Strategy created successfully', 'success');
        // Force route reload
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/strategy']);
        });
      });
    }
    else {
      this.userServ.uploadFiles(submitedStrategy.attachments).subscribe({
        next: (uploadRes: any) => {
          const attachments = uploadRes.links;
          const newStrategy: IStrategy = {
            tenantId: submitedStrategy.tenantId,
            title: submitedStrategy.title,
            departmentId: submitedStrategy.departmentId,
            description: submitedStrategy.description,
            goals: submitedStrategy.goals,
            budget: submitedStrategy.budget,
            active: submitedStrategy.active,
            attachments: this.handleAttachmentsList(attachments)
          };
          this.strategyService.createStrategy(newStrategy).subscribe((res: any) => {
            this.toast.show('Strategy created successfully', 'success');
            // Force route reload
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/strategy']);
            });
          });
        },
        error: (err: any) => {
          console.error('Error uploading files: ', err);
        }
      });
    }
  }

  deleteStrategy(strategyId: string | undefined){
    if (!strategyId) {
      // Remove first element in taskList
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res){
          this.toast.show('Strategy deleted successfully', 'success');
          this.strategyList.update(list => list.slice(1));
        }
      });
    }
    else{
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res){
          this.strategyService.deleteStrategy(strategyId).subscribe(() => {
            this.toast.show('Strategy deleted successfully', 'success');
            this.strategyList.update(list => list.filter(task => task.id !== strategyId));
          });
        }
      });
    }
  }
}
