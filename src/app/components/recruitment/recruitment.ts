import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { DeleteValidationModal } from './../delete-validation-modal/delete-validation-modal';
import { NewRecruitmentModal } from './../new-recruitment-modal/new-recruitment-modal';
import { ViewRecruitmentModal } from '../view-recruitment-modal/view-recruitment-modal';
import { IRecruitment, recruitmentStatus } from '../../interfaces/IRecruitment';
import { Recruitments } from '../../services/recruitment.js';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationButton } from "../pagination-button/pagination-button";
import { Branch } from '../../services/branch';
import { User } from '../../services/user';
import { HasPermissionDirective } from '../../directives/has-permission';
import { Router } from '@angular/router';
import { AddApplicationModal } from '../add-application-modal/add-application-modal';
import { HasAnyPermissionDirective } from '../../directives/hasAnyPermission';
import { SkeletonTable } from '../skeleton-table/skeleton-table';
import { Toast } from '../toast/toast';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-recruitment',
  standalone: true,
  imports: [NewRecruitmentModal, Toast, SkeletonTable, HasAnyPermissionDirective, AddApplicationModal, HasPermissionDirective, ViewRecruitmentModal, DatePipe, DeleteValidationModal, TranslateModule, PaginationButton],
  templateUrl: './recruitment.html',
  styleUrls: ['./recruitment.scss', '../../../styles.scss']
})
export class Recruitment implements OnInit {
  isLoading = signal<boolean>(true);
  recruitmentList = signal<IRecruitment[]>([]);
  recruitmentStatus = recruitmentStatus;
  @ViewChild(NewRecruitmentModal) recruitmentModal!: NewRecruitmentModal;
  @ViewChild(ViewRecruitmentModal) viewModal!: ViewRecruitmentModal;
  @ViewChild(DeleteValidationModal) deleteModal!: DeleteValidationModal;
  @ViewChild(AddApplicationModal) addApplicationModal!: AddApplicationModal;
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(0);
  currentBranch = signal<string>('');
  lastPageReached = signal(false);
  lastPage = signal(10000); // Set initial large number

  constructor(private recService: Recruitments, private branchService: Branch, private userServ: User, private router: Router, private toast: ToastService) {}

  ngOnInit() {
    this.branchService.currentBranch$.subscribe(branch => {
      this.currentBranch.set(branch);
      this.loadRecruitments(1);
    });
  }

  loadRecruitments(page: number, branchName: string = this.currentBranch()) {
    this.isLoading.set(true);
    this.recService.getRecruitments(page, branchName).subscribe((res: any) => {
      if (res.recruitments.length === 0 && page > 1) {
        this.loadRecruitments(page - 1, branchName);
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
      this.recruitmentList.set(res.recruitments);
      console.log('Loaded Recruitments: ', res.recruitments);
      this.itemsPerPage.set(res.recruitments.length);
      this.currentPage.set(page);
      this.isLoading.set(false);
    });
  }

  openNewRecruitmentModal() {
    this.recruitmentModal.open();
  }

  openViewRecruitmentModal(rec: IRecruitment) {
    this.viewModal.open(rec);
  }

  openAddApplicationModal(rec: IRecruitment) {
    this.addApplicationModal.open(rec);
  }

  updateRecruitment(submitedRecruitment: any) {
    if (submitedRecruitment.updatedAttachments.getAll('files').length === 0){
      const newRecruitment: any = {
        tenantId: submitedRecruitment.tenantId,
        position: submitedRecruitment.position,
        departmentId: submitedRecruitment.departmentId,
        description: submitedRecruitment.description,
        status: submitedRecruitment.status,
        requirements: submitedRecruitment.requirements,
        active: submitedRecruitment.active,
        attachments: submitedRecruitment.currentAttachments
      };
      this.recService.updateRecruitment(submitedRecruitment.id!, newRecruitment).subscribe((res: any) => {
        this.toast.show('Recruitment updated successfully', 'success');
        // Force route reload
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/recruitment']);
        });
      });
    }
    else {
      this.userServ.uploadFiles(submitedRecruitment.updatedAttachments).subscribe({
        next: (uploadRes: any) => {
          const attachments = uploadRes.links;
          if (!Array.isArray(submitedRecruitment.currentAttachments)) {
            submitedRecruitment.currentAttachments = submitedRecruitment.currentAttachments ? submitedRecruitment.currentAttachments.split(/,(?=\/uploads\/center\/)/) : [];
          }
          submitedRecruitment.currentAttachments = [
            ...submitedRecruitment.currentAttachments,
            ...attachments
          ].join(',');
          const newRecruitment: any = {
            tenantId: submitedRecruitment.tenantId,
            position: submitedRecruitment.position,
            departmentId: submitedRecruitment.departmentId,
            description: submitedRecruitment.description,
            status: submitedRecruitment.status,
            requirements: submitedRecruitment.requirements,
            active: submitedRecruitment.active,
            attachments: submitedRecruitment.currentAttachments
          };
          this.recService.updateRecruitment(submitedRecruitment.id!, newRecruitment).subscribe((res: any) => {
            this.toast.show('Recruitment updated successfully', 'success');
            // Force route reload
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/recruitment']);
            });
          });
        },
        error: (err: any) => {
          console.error('Error uploading files: ', err);
        }
      });
    }
  }

  addApplication(application: any) {
    this.userServ.uploadFiles(application.resume).subscribe({
      next: (uploadRes: any) => {
        const resume = uploadRes.links;
        const newRecruitment: any = {
          tenantId: this.currentBranch(),
          position: application.position,
          departmentId: application.departmentId,
          applications: [
            ...application.currentApplications,
            {
              applicantName: application.applicantName,
              applicantEmail: application.applicantEmail,
              resume: this.handleAttachmentsList(resume)
            }
          ]
        };
        console.log('New Recruitment Application to submit: ', newRecruitment);
        this.recService.updateRecruitment(application.id!, newRecruitment).subscribe((res: any) => {
          this.toast.show('Recruitment application added successfully', 'success');
          // Force route reload
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/recruitment']);
          });
        });
      },
      error: (err: any) => {
        console.error('Error uploading files: ', err);
      }
    });
  }

  handleAttachmentsList(list: string[]): string {
    let attachments: string = '';
    for (let i = 0; i < list.length; i++) {
      attachments += list[i] + ',';
    }
    return attachments.slice(0, -1);
  }

  saveNewRecruitment(submitedRecruitment: any) {
    if (submitedRecruitment.attachments.getAll('files').length === 0){
      const newRecruitment: IRecruitment = {
        tenantId: submitedRecruitment.tenantId,
        position: submitedRecruitment.position,
        departmentId: submitedRecruitment.departmentId,
        description: submitedRecruitment.description,
        status: submitedRecruitment.status,
        createdById: submitedRecruitment.createdById,
        requirements: submitedRecruitment.requirements,
        applications: submitedRecruitment.applications,
        active: submitedRecruitment.active,
        attachments: ''
      };
      this.recService.createRecruitment(newRecruitment).subscribe((res: any) => {
        this.toast.show('Recruitment created successfully', 'success');
        // Force route reload
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/recruitment']);
        });
      });
    }
    else {
      this.userServ.uploadFiles(submitedRecruitment.attachments).subscribe({
        next: (uploadRes: any) => {
          const attachments = uploadRes.links;
          const newRecruitment: IRecruitment = {
            tenantId: submitedRecruitment.tenantId,
            position: submitedRecruitment.position,
            departmentId: submitedRecruitment.departmentId,
            description: submitedRecruitment.description,
            status: submitedRecruitment.status,
            createdById: submitedRecruitment.createdById,
            requirements: submitedRecruitment.requirements,
            applications: submitedRecruitment.applications,
            active: submitedRecruitment.active,
            attachments: this.handleAttachmentsList(attachments)
          };
          this.recService.createRecruitment(newRecruitment).subscribe((res: any) => {
            this.toast.show('Recruitment created successfully', 'success');
            // Force route reload
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/recruitment']);
            });
          });
        },
        error: (err: any) => {
          console.error('Error uploading files: ', err);
        }
      });
    }
  }

  deleteRecruitment(recId: string | undefined){
    if (!recId) {
      // Remove first element in taskList
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res){
          this.recruitmentList.update(list => list.slice(1));
          this.toast.show('Recruitment deleted successfully', 'success');
        }
      });
    }
    else {
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res){
          this.recService.deleteRecruitment(recId).subscribe(() => {
            this.toast.show('Recruitment deleted successfully', 'success');
            this.recruitmentList.update(list => list.filter(rec => rec.id !== recId));
          });
        }
      });
    }
  }

}
