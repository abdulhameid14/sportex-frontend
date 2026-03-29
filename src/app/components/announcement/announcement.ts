import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { DeleteValidationModal } from './../delete-validation-modal/delete-validation-modal';
import { NewAnnouncementModal } from './../new-announcement-modal/new-announcement-modal';
import { ViewAnnouncementModal } from '../view-announcement-modal/view-announcement-modal';
import { Announcement } from '../../services/announcement';
import { TranslateModule } from '@ngx-translate/core';
import { IAnnouncement } from './../../interfaces/IAnnouncement';
import { DatePipe } from '@angular/common';
import { PaginationButton } from "../pagination-button/pagination-button";
import { Branch } from '../../services/branch';
import { User } from '../../services/user';
import { Router } from '@angular/router';
import { HasPermissionDirective } from '../../directives/has-permission';
import { HasAnyPermissionDirective } from '../../directives/hasAnyPermission';
import { SkeletonTable } from '../skeleton-table/skeleton-table';
import { Toast } from '../toast/toast';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-announcement',
  standalone: true,
  imports: [NewAnnouncementModal, Toast, SkeletonTable, HasAnyPermissionDirective, HasPermissionDirective, ViewAnnouncementModal, DeleteValidationModal, TranslateModule, DatePipe, PaginationButton],
  templateUrl: './announcement.html',
  styleUrls: ['./announcement.scss']
})
export class Announcements implements OnInit {
  annList = signal<IAnnouncement[]>([]);
  isLoading = signal<boolean>(true);
  @ViewChild(NewAnnouncementModal) annModal!: NewAnnouncementModal;
  @ViewChild(ViewAnnouncementModal) viewModal!: ViewAnnouncementModal;
  @ViewChild(DeleteValidationModal) deleteModal!: DeleteValidationModal;
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(0);
  currentBranch = signal<string>('');
  lastPageReached = signal(false);
  lastPage = signal(10000); // Set initial large number

  constructor(private annService: Announcement, private branchService: Branch, private userServ: User, private router: Router, private toast: ToastService) {}

  ngOnInit() {
    this.branchService.currentBranch$.subscribe(branch => {
      this.currentBranch.set(branch);
      this.loadAnnouncements(1);
    });
  }

  loadAnnouncements(page: number, branchName: string = this.currentBranch()) {
    this.isLoading.set(true);
    this.annService.getAnnouncements(page, branchName).subscribe((res: any) => {
      if (res.announcements.length === 0 && page > 1) {
        this.loadAnnouncements(page - 1, branchName);
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
      this.annList.set(res.announcements);
      this.currentPage.set(page);
      this.itemsPerPage.set(res.announcements.length);
      this.isLoading.set(false);
    });
  }

  openNewAnnouncementModal() {
    this.annModal.open();
  }

  openViewAnnouncementModal(announcement: IAnnouncement) {
    this.viewModal.open(announcement);
  }

  updateAnnouncement(submitedAnnouncement: any) {
    if(submitedAnnouncement.newAttachments.getAll('files').length === 0){
      const newAnnouncement: any = {
        title: submitedAnnouncement.title,
        tenantId: submitedAnnouncement.tenantId,
        content: submitedAnnouncement.content,
        departmentId: submitedAnnouncement.departmentId,
        active: submitedAnnouncement.active,
        attachments: submitedAnnouncement.currentAttachments
      };
      console.log('Saving Announcement: ', newAnnouncement);
      this.annService.updateAnnouncement(submitedAnnouncement.id!, newAnnouncement).subscribe((res: any) => {
        this.toast.show('Announcement updated successfully', 'success');
        // Force route reload
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/announcement']);
        });
      });
    }
    else {
      this.userServ.uploadFiles(submitedAnnouncement.newAttachments).subscribe({
        next: (res) => {
          const attachments = res.links;
          if (!Array.isArray(submitedAnnouncement.currentAttachments)) {
            submitedAnnouncement.currentAttachments = submitedAnnouncement.currentAttachments ? submitedAnnouncement.currentAttachments.split(/,(?=\/uploads\/center\/)/) : [];
          }
          submitedAnnouncement.currentAttachments = [
            ...submitedAnnouncement.currentAttachments,
            ...attachments
          ].join(',');
          const newAnnouncement: any = {
            title: submitedAnnouncement.title,
            tenantId: submitedAnnouncement.tenantId,
            content: submitedAnnouncement.content,
            departmentId: submitedAnnouncement.departmentId,
            active: submitedAnnouncement.active,
            attachments: submitedAnnouncement.currentAttachments
          };
          console.log('Saving Announcement: ', newAnnouncement);
          this.annService.updateAnnouncement(submitedAnnouncement.id!, newAnnouncement).subscribe((res: any) => {
            this.toast.show('Announcement updated successfully', 'success');
            // Force route reload
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/announcement']);
            });
          });
        },
        error: (err) => { console.error('File upload error:', err); }
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

  saveNewAnnouncement(submitedAnnouncement: any) {
    if(submitedAnnouncement.attachments.getAll('files').length === 0){
      const newAnnouncement: IAnnouncement = {
        title: submitedAnnouncement.title,
        content: submitedAnnouncement.content,
        creatorId: submitedAnnouncement.creatorId,
        tenantId: submitedAnnouncement.tenantId,
        departmentId: submitedAnnouncement.departmentId,
        active: submitedAnnouncement.active,
        attachments: ''
      };
      console.log('Saving Announcement: ', newAnnouncement);
      this.annService.createAnnouncement(newAnnouncement).subscribe((res: any) => {
        this.toast.show('Announcement created successfully', 'success');
        // Force route reload
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/announcement']);
        });
      });
    }
    else {
      this.userServ.uploadFiles(submitedAnnouncement.attachments).subscribe({
        next: (res) => {
          res.links = res.links.map((link: string) => link = "https://api.kayanatdashboard.com/api" + link);
          const attachments = res.links;
          console.log('Uploaded attachments links:', attachments);
          const newAnnouncement: IAnnouncement = {
            title: submitedAnnouncement.title,
            content: submitedAnnouncement.content,
            creatorId: submitedAnnouncement.creatorId,
            tenantId: submitedAnnouncement.tenantId,
            departmentId: submitedAnnouncement.departmentId,
            active: submitedAnnouncement.active,
            attachments: this.handleAttachmentsList(attachments)
          };
          console.log('Saving Announcement: ', newAnnouncement);
          this.annService.createAnnouncement(newAnnouncement).subscribe((res: any) => {
            this.toast.show('Announcement created successfully', 'success');
            // Force route reload
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/announcement']);
            });
          });
        },
        error: (err) => { console.error('File upload error:', err); }
      });
    }
  }

  deleteAnnouncement(announcementId: string | undefined){
    if (!announcementId) {
      // Remove first element in taskList
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res){
          this.annList.update(list => list.slice(1));
          this.toast.show('Announcement deleted successfully', 'success');
        }
      });
    }
    else {
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res){
          this.annService.deleteAnnouncement(announcementId).subscribe(() => {
            this.annList.update(list => list.filter(announcement => announcement.id !== announcementId));
            this.toast.show('Announcement deleted successfully', 'success');
          });
        }
      });
    }
  }
}
