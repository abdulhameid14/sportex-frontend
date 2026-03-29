import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { DeleteValidationModal } from './../delete-validation-modal/delete-validation-modal';
import { NewTransactionModal } from './../new-transaction-modal/new-transaction-modal';
import { ViewTransactionModal } from '../view-transaction-modal/view-transaction-modal';
import { TranslateModule } from '@ngx-translate/core';
import { IReport } from '../../interfaces/IReport';
import { Report } from '../../services/report';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { PaginationButton } from "../pagination-button/pagination-button";
import { Branch } from '../../services/branch';
import { Request } from '../../services/request';
import { User } from '../../services/user';
import { HasPermissionDirective } from '../../directives/has-permission';
import { Router } from '@angular/router';
import { HasAnyPermissionDirective } from '../../directives/hasAnyPermission';
import { SkeletonTable } from '../skeleton-table/skeleton-table';
import { Toast } from '../toast/toast';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [NewTransactionModal, Toast, SkeletonTable, HasAnyPermissionDirective, HasPermissionDirective, ViewTransactionModal, DeleteValidationModal, TranslateModule, DatePipe, CurrencyPipe, PaginationButton],
  templateUrl: './finance.html',
  styleUrls: ['./finance.scss', '../../../styles.scss']
})
export class Finance implements OnInit {
  isLoading = signal<boolean>(true);
  transactionList = signal<IReport[]>([]);
  @ViewChild(NewTransactionModal) transactionModal!: NewTransactionModal;
  @ViewChild(ViewTransactionModal) viewModal!: ViewTransactionModal;
  @ViewChild(DeleteValidationModal) deleteModal!: DeleteValidationModal;
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(0);
  currentBranch = signal<string>('');
  lastPageReached = signal(false);
  lastPage = signal(10000); // Set initial large number

  constructor(private toast: ToastService, private transService: Report, private branchService: Branch, private requestService: Request, private userServ: User, private router: Router) { }

  ngOnInit() {
    this.branchService.currentBranch$.subscribe(branch => {
      this.currentBranch.set(branch);
      this.loadTransactions(1);
    });
  }

  loadTransactions(page: number, branchName: string = this.currentBranch()) {
    this.isLoading.set(true);
    this.transService.getTransactions(page, branchName).subscribe((res: any) => {
      if (res.length === 0 && page > 1) {
        this.loadTransactions(page - 1, branchName);
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
      this.transactionList.set(res);
      this.itemsPerPage.set(res.length);
      this.currentPage.set(page);
      this.isLoading.set(false);
    });
  }

  openNewTransactionModal() {
    this.transactionModal.open();
  }

  openViewTransactionModal(transaction: IReport) {
    this.viewModal.open(transaction);
  }

  updateTransaction(transaction: any) {
    console.log('files :', transaction.updatedAttachments.getAll('files'));
    if (transaction.updatedAttachments.getAll('files').length === 0) {
      const newTransaction: any = {
        title: transaction.title,
        content: transaction.content,
        departmentId: transaction.departmentId,
        data: transaction.data,
        attachments: transaction.currentAttachments
      };
      this.transService.updateReport(transaction.id!, newTransaction).subscribe((res: any) => {
        this.transactionList.update(list => list.map(item => (item.id === transaction.id ? { ...transaction } : item)));
        this.toast.show('Transaction updated successfully', 'success');
        // Force route reload
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/finance']);
        });
      });
    }
    else {
      this.userServ.uploadFiles(transaction.updatedAttachments).subscribe({
        next: (res: any) => {
          const attachments = res.links;
          if (!Array.isArray(transaction.currentAttachments)) {
            transaction.currentAttachments = transaction.currentAttachments ? transaction.currentAttachments.split(/,(?=\/uploads\/center\/)/) : [];
          }
          transaction.currentAttachments = [
            ...transaction.currentAttachments,
            ...attachments
          ].join(',');
          const newTransaction: any = {
            title: transaction.title,
            content: transaction.content,
            departmentId: transaction.departmentId,
            data: transaction.data,
            attachments: transaction.currentAttachments
          };
          this.transService.updateReport(transaction.id!, newTransaction).subscribe((res: any) => {
            this.toast.show('Transaction updated successfully', 'success');
            // Force route reload
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/finance']);
            });
          });
        },
        error: (err) => {
          console.error('File upload error: ', err);
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

  saveNewTransaction(submitedTransaction: any) {
    if (submitedTransaction.attachments.getAll('files').length === 0) {
      const newTransaction: IReport = {
        tenantId: submitedTransaction.tenantId,
        title: submitedTransaction.title,
        content: submitedTransaction.content,
        departmentId: submitedTransaction.departmentId,
        data: submitedTransaction.data,
        attachments: '',
        creatorId: submitedTransaction.creatorId,
      };
      this.transService.createReport(newTransaction).subscribe((res: any) => {
        this.toast.show('Transaction created successfully', 'success');
        // Force route reload
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/finance']);
        });
      });
    }
    else {
      this.userServ.uploadFiles(submitedTransaction.attachments).subscribe({
        next: (res: any) => {
          const attachments = res.links;
          const newTransaction: IReport = {
            tenantId: submitedTransaction.tenantId,
            title: submitedTransaction.title,
            content: submitedTransaction.content,
            departmentId: submitedTransaction.departmentId,
            data: submitedTransaction.data,
            attachments: this.handleAttachmentsList(attachments),
            creatorId: submitedTransaction.creatorId,
          };
          this.transService.createReport(newTransaction).subscribe((res: any) => {
            this.toast.show('Transaction created successfully', 'success');
            // Force route reload
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/finance']);
            });
          });
        },
        error: (err) => {
          console.error('File upload error: ', err);
        }
      });
    }
  }

  deleteTransaction(transactionId: string | undefined) {
    if (!transactionId) {
      // Remove first element in taskList
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res) {
          this.transactionList.update(list => list.slice(1));
          this.toast.show('Transaction deleted successfully', 'success');
        }
      });
    }
    else {
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res) {
          this.transService.deleteReport(transactionId).subscribe(() => {
            this.toast.show('Transaction deleted successfully', 'success');
            this.transactionList.update(list => list.filter(transaction => transaction.id !== transactionId));
          });
        }
      });
    }
  }
}
