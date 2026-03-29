import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { DeleteValidationModal } from './../delete-validation-modal/delete-validation-modal';
import { NewRequestTypeModal } from './../new-request-type-modal/new-request-type-modal';
import { NewRequestModal } from './../new-request-modal/new-request-modal';
import { ViewRequestModal } from './../view-request-modal/view-request-modal';
import { ViewRequestTypeModal } from '../view-request-type-modal/view-request-type-modal';
import { Request } from '../../services/request.js';
import { IRequest, IRequestType, status } from '../../interfaces/IRequest';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationButton } from "../pagination-button/pagination-button";
import { Branch } from '../../services/branch';
import { User } from '../../services/user';
import { HasPermissionDirective } from '../../directives/has-permission';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HasAnyPermissionDirective } from '../../directives/hasAnyPermission';
import { SkeletonTable } from '../skeleton-table/skeleton-table';
import { Toast } from '../toast/toast';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [ViewRequestModal, Toast, SkeletonTable, HasAnyPermissionDirective, HasPermissionDirective, ViewRequestTypeModal, NewRequestModal, DatePipe, DeleteValidationModal, NewRequestTypeModal, TranslateModule, PaginationButton, FormsModule],
  templateUrl: './requests.html',
  styleUrls: ['./requests.scss', '../../../styles.scss']
})
export class Requests implements OnInit {
  isLoading = signal<boolean>(true);
  requestList = signal<IRequest[]>([]);
  requestTypeList = signal<IRequestType[]>([]);
  requestStatus = status;
  currentTab = signal('all');
  statusFilter = signal('ALL');

  @ViewChild(NewRequestModal) requestModal!: NewRequestModal;
  @ViewChild(NewRequestTypeModal) requestTypeModal!: NewRequestTypeModal;
  @ViewChild(DeleteValidationModal) deleteModal!: DeleteValidationModal;
  @ViewChild(ViewRequestModal) viewModal!: ViewRequestModal;
  @ViewChild(ViewRequestTypeModal) viewRequestTypeModal!: ViewRequestTypeModal;
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(0);
  currentBranch = signal('');
  lastPageReached = signal(false);
  lastPage = signal(10000); // Set initial large number

  constructor(private reqService: Request, private branchService: Branch, private userServ: User, private router: Router, private toast: ToastService) { }

  ngOnInit() {
    this.branchService.currentBranch$.subscribe(branch => {
      this.currentBranch.set(branch);
      this.loadRequests(1);
    });
  }

  loadRequests(page: number) {
    if (this.currentTab() === 'all') {
      this.isLoading.set(true);
      this.reqService.getRequests(page, this.currentBranch(), this.statusFilter()).subscribe((res: any) => {
        if (res.requests.length === 0 && page > 1) {
          this.loadRequests(page - 1);
          this.lastPageReached.set(true);
          this.lastPage.set(page - 1);
          this.isLoading.set(false);
          return;
        }
        if (page === this.lastPage()) {
          this.lastPageReached.set(true);
        }
        else {
          this.lastPageReached.set(false);
        }
        // Apply filter
        this.requestList.set(res.requests);
        this.itemsPerPage.set(res.requests.length);
        this.currentPage.set(page);
        this.requestTypeList.set([]);
        this.isLoading.set(false);
      });
    }

    if (this.currentTab() === 'requestTypes') {
      this.isLoading.set(true);
      this.reqService.getRequestTypes(this.currentBranch()).subscribe((res: any) => {
        if (res.requestTypes.length === 0 && page > 1) {
          this.loadRequests(page - 1);
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
        this.requestTypeList.set(res.requestTypes);
        this.itemsPerPage.set(res.requestTypes.length);
        this.currentPage.set(page);
        this.requestList.set([]);
        this.isLoading.set(false);
      });
    }
  }

  changeTab(tab: string) {
    this.currentTab.set(tab);
    this.loadRequests(1);
  }

  openNewRequestModal() {
    this.requestModal.open();
  }

  openNewRequestTypeModal() {
    this.requestTypeModal.open();
  }

  handleAttachmentsList(list: string[]): string {
    let attachments: string = '';
    for (let i = 0; i < list.length; i++) {
      attachments += list[i] + ',';
    }
    return attachments.slice(0, -1);
  }

  saveNewRequest(submitedRequest: any) {
    console.log('Submitted Request: ', submitedRequest);
    if (submitedRequest.attachments.getAll('files').length === 0) {
      const newRequest: IRequest = {
        tenantId: submitedRequest.tenantId,
        title: submitedRequest.title,
        description: submitedRequest.description,
        typeId: submitedRequest.typeId,
        departmentId: submitedRequest.departmentId,
        documentToSign: '',
        attachments: '',
        budget: submitedRequest.budget,
        //count: submitedRequest.count,
        to: submitedRequest.to,
        assigneeEmployeeId: submitedRequest.assigneeEmployeeId,
        requesterEmployeeId: submitedRequest.requesterEmployeeId,
        status: submitedRequest.status,
        action: submitedRequest.action,
        projectId: submitedRequest.projectId,
        taskId: submitedRequest.taskId,
      };
      this.reqService.createRequest(newRequest).subscribe((res: any) => {
        this.toast.show('Request created successfully', 'success');
        // Force route reload
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/requests']);
        });
      });
    }
    else {
      console.log('Submitted Request: ', submitedRequest);
      this.userServ.uploadFiles(submitedRequest.attachments).subscribe({
        next: (uploadRes: any) => {
          const attachments = uploadRes.links;
          console.log('Uploaded attachments: ', attachments);
          console.log('submited attachments: ', this.handleAttachmentsList(attachments));
          const newRequest: IRequest = {
            tenantId: submitedRequest.tenantId,
            title: submitedRequest.title,
            description: submitedRequest.description,
            typeId: submitedRequest.typeId,
            departmentId: submitedRequest.departmentId,
            documentToSign: '',
            attachments: this.handleAttachmentsList(attachments),
            assigneeEmployeeId: submitedRequest.assigneeEmployeeId,
            requesterEmployeeId: submitedRequest.requesterEmployeeId,
            status: submitedRequest.status,
            action: submitedRequest.action,
            projectId: submitedRequest.projectId,
            taskId: submitedRequest.taskId,
            budget: submitedRequest.budget,
            //count: submitedRequest.count,
            to: submitedRequest.to,
          };
          this.reqService.createRequest(newRequest).subscribe((res: any) => {
            this.toast.show('Request created successfully', 'success');
            // Force route reload
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/requests']);
            });
          });
        },
        error: (err: any) => { console.error('Attachments upload error: ', err); }
      });
    }
  }

  saveNewRequestType(submitedRequest: any) {
    console.log('Submitted Request Type: ', submitedRequest);
    if (submitedRequest.templateDocument.getAll('files').length === 0) {
      const newRequestType: IRequestType = {
        tenantId: submitedRequest.tenantId,
        name: submitedRequest.name,
        description: submitedRequest.description,
        fee: submitedRequest.fee,
      };
      this.reqService.createRequestType(newRequestType).subscribe((res: any) => {
        const requestTypeId = res.requestType.id;
        const signer: any = {
          requestTypeId: requestTypeId,
          signerIds: submitedRequest.employeeIds,
        }
        this.reqService.createRequestSigners(signer).subscribe({
          next: (res: any) => {
            this.toast.show('Request Type created successfully', 'success');
            // Force route reload
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/requests']);
            });
          },
          error: (err: any) => {
            this.reqService.deleteRequestType(requestTypeId).subscribe((res) => {
              console.error('Error creating Request Type Signers. Rolled back Request Type creation: ', err);
            });
          }
        });
      });
    }
    else {
      this.userServ.uploadFiles(submitedRequest.templateDocument).subscribe({
        next: (uploadRes: any) => {
          const templateDocument = uploadRes.links;
          const newRequestType: IRequestType = {
            tenantId: submitedRequest.tenantId,
            name: submitedRequest.name,
            description: submitedRequest.description,
            templateDocument: this.handleAttachmentsList(templateDocument),
          };
          this.reqService.createRequestType(newRequestType).subscribe((res: any) => {
            const requestTypeId = res.requestType.id;
            const signer: any = {
              requestTypeId: requestTypeId,
              signerIds: submitedRequest.employeeIds,
            }
            this.reqService.createRequestSigners(signer).subscribe({
              next: (res: any) => {
                this.toast.show('Request Type created successfully', 'success');
                // Force route reload
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                  this.router.navigate(['/requests']);
                });
              },
              error: (err: any) => {
                this.reqService.deleteRequestType(requestTypeId).subscribe((res) => {
                  console.error('Error creating Request Type Signers. Rolled back Request Type creation: ', err);
                });
              }
            });
          });
        },
        error: (err: any) => { console.error('Template Document upload error: ', err); }
      });
    }
  }

  openViewRequestModal(request: IRequest) {
    this.viewModal.open(request);
  }

  openViewRequestTypeModal(requestType: IRequestType) {
    this.viewRequestTypeModal.open(requestType);
  }

  updateRequest(submitedRequest: any) {
    console.log('Submitted Request Type: ', submitedRequest);
    if (submitedRequest.newAttachments.getAll('files').length === 0) {
      const newRequest: any = {
        tenantId: submitedRequest.tenantId,
        title: submitedRequest.title,
        description: submitedRequest.description,
        status: submitedRequest.status,
        action: submitedRequest.action,
        assigneeEmployeeId: submitedRequest.assigneeEmployeeId,
        departmentId: submitedRequest.departmentId,
        to: submitedRequest.to,
        budget: submitedRequest.budget,
        //count: submitedRequest.count,
        taskId: submitedRequest.taskId,
        projectId: submitedRequest.projectId,
        attachments: submitedRequest.currentAttachments,
        //signers: submitedRequest.signers,
      };
      this.reqService.updateRequest(submitedRequest.id!, newRequest).subscribe((res: any) => {
        this.toast.show('Request updated successfully', 'success');
        // Force route reload
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/requests']);
        });
      });
    }
    else {
      this.userServ.uploadFiles(submitedRequest.newAttachments).subscribe({
        next: (uploadRes: any) => {
          const attachments = uploadRes.links;
          console.log('Uploaded attachments: ', attachments);
          console.log('old attachments: ', submitedRequest.currentAttachments);
          if (!Array.isArray(submitedRequest.currentAttachments)) {
            submitedRequest.currentAttachments = submitedRequest.currentAttachments ? submitedRequest.currentAttachments.split(/,(?=\/uploads\/center\/)/) : [];
          }
          submitedRequest.currentAttachments = [
            ...submitedRequest.currentAttachments,
            ...attachments
          ].join(',');
          console.log('Updated currentAttachments: ', submitedRequest.currentAttachments);
          const newRequest: any = {
            tenantId: submitedRequest.tenantId,
            title: submitedRequest.title,
            description: submitedRequest.description,
            status: submitedRequest.status,
            action: submitedRequest.action,
            assigneeEmployeeId: submitedRequest.assigneeEmployeeId,
            departmentId: submitedRequest.departmentId,
            to: submitedRequest.to,
            budget: submitedRequest.budget,
            //count: submitedRequest.count,
            taskId: submitedRequest.taskId,
            projectId: submitedRequest.projectId,
            attachments: submitedRequest.currentAttachments,
            //signers: submitedRequest.signers,
          };
          this.reqService.updateRequest(submitedRequest.id!, newRequest).subscribe((res: any) => {
            this.toast.show('Request updated successfully', 'success');
            // Force route reload
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/requests']);
            });
          });
        },
        error: (err: any) => { console.error('Attachment upload error: ', err); }
      });
    }
  }

  updateRequestType(submitedRequest: any) {
    console.log('Submitted Request Type: ', submitedRequest);
    if (submitedRequest.newTemplateDocument.getAll('files').length === 0) {
      const newRequestType: any = {
        tenantId: submitedRequest.tenantId,
        name: submitedRequest.name,
        description: submitedRequest.description,
        templateDocument: submitedRequest.currentTemplateDocument,
      };
      this.reqService.updateRequestType(submitedRequest.id!, newRequestType).subscribe((res: any) => {
        console.log('Request Type updated: ', res);
        if (submitedRequest.signerIds.length > 0) {
          const signer: any = {
            requestTypeId: submitedRequest.id,
            signerIds: submitedRequest.signerIds,
          }
          this.reqService.createRequestSigners(signer).subscribe({
            next: (res: any) => {
              this.toast.show('Request Type updated successfully', 'success');
              // Force route reload
              this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this.router.navigate(['/requests']);
              });
            },
            error: (err: any) => {
              console.error('Error creating Request Type Signers. Rolled back Request Type creation: ', err);
            }
          });
        }
        else {
          this.toast.show('Request Type updated successfully', 'success');
          // Force route reload
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/requests']);
          });
        }
      });
    }
    else {
      this.userServ.uploadFiles(submitedRequest.newTemplateDocument).subscribe({
        next: (uploadRes: any) => {
          console.log('New Template Document: ', uploadRes);
          if (!Array.isArray(submitedRequest.currentTemplateDocument)) {
            submitedRequest.currentTemplateDocument = submitedRequest.currentTemplateDocument ? submitedRequest.currentTemplateDocument.split(/,(?=\/uploads\/center\/)/) : [];
          }
          submitedRequest.currentTemplateDocument = [
            ...submitedRequest.currentTemplateDocument,
            ...uploadRes.links
          ].join(',');
          console.log('Updated Template Document: ', submitedRequest.currentTemplateDocument);
          const newRequestType: any = {
            tenantId: submitedRequest.tenantId,
            name: submitedRequest.name,
            description: submitedRequest.description,
            templateDocument: submitedRequest.currentTemplateDocument
          };
          this.reqService.updateRequestType(submitedRequest.id!, newRequestType).subscribe((res: any) => {
            console.log('Request Type updated: ', res);
            if (submitedRequest.signerIds.length > 0) {
              const signer: any = {
                requestTypeId: submitedRequest.id,
                signerIds: submitedRequest.signerIds,
              }
              this.reqService.createRequestSigners(signer).subscribe({
                next: (res: any) => {
                  this.toast.show('Request Type updated successfully', 'success');
                  // Force route reload
                  this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                    this.router.navigate(['/requests']);
                  });
                },
                error: (err: any) => {
                  console.error('Error creating Request Type Signers. Rolled back Request Type creation: ', err);
                }
              });
            }
            else {
              this.toast.show('Request Type updated successfully', 'success');
              // Force route reload
              this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this.router.navigate(['/requests']);
              });
            }
          });
        },
        error: (err: any) => { console.error('Template Document upload error: ', err); }
      });
    }
  }

  deleteRequest(reqId: string | undefined) {
    if (!reqId) {
      // Remove first element in taskList
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res) {
          this.requestList.update(list => list.slice(1));
          this.toast.show('Request deleted successfully', 'success');
        }
      });
    }
    else {
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res) {
          this.reqService.deleteRequest(reqId).subscribe(() => {
            this.toast.show('Request deleted successfully', 'success');
            this.requestList.update(list => list.filter(req => req.id !== reqId));
          });
        }
      });
    }
  }

  deleteRequestType(reqTypeId: string | undefined) {
    if (!reqTypeId) {
      // Remove first element in taskList
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res) {
          this.requestTypeList.update(list => list.slice(1));
          this.toast.show('Request Type deleted successfully', 'success');
        }
      });
    }
    else {
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res) {
          this.reqService.deleteRequestType(reqTypeId).subscribe((res2) => {
            this.toast.show('Request Type deleted successfully', 'success');
            this.requestTypeList.update(list => list.filter(type => type.id !== reqTypeId));
            console.log('request type deleted: ', res2);
          });
        }
      });
    }
  }
}
