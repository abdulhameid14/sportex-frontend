import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { DeleteValidationModal } from './../delete-validation-modal/delete-validation-modal';
import { NewProjectModal } from './../new-project-modal/new-project-modal';
import { ViewProjectModal } from '../view-project-modal/view-project-modal';
import { IProject } from '../../interfaces/IProject';
import { Project } from '../../services/project';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationButton } from "../pagination-button/pagination-button";
import { Branch } from '../../services/branch';
import { User } from '../../services/user';
import { HasPermissionDirective } from '../../directives/has-permission';
import { Router } from '@angular/router';
import { HasAnyPermissionDirective } from '../../directives/hasAnyPermission';
import { SkeletonTable } from '../skeleton-table/skeleton-table';
import { Toast } from '../toast/toast';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-projects',
  imports: [NewProjectModal, Toast, SkeletonTable, HasAnyPermissionDirective, ViewProjectModal, HasPermissionDirective, DatePipe, DeleteValidationModal, TranslateModule, PaginationButton],
  templateUrl: './projects.html',
  styleUrls: ['./projects.scss', '../../../styles.scss']
})
export class Projects implements OnInit {
  isLoading = signal<boolean>(true);
  projectsList = signal<IProject[]>([]);
  @ViewChild(NewProjectModal) projectModal!: NewProjectModal;
  @ViewChild(ViewProjectModal) viewModal!: ViewProjectModal;
  @ViewChild(DeleteValidationModal) deleteModal!: DeleteValidationModal;
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(0);
  currentBranch = signal<string>('');
  lastPageReached = signal(false);
  lastPage = signal(10000); // Set initial large number

  constructor(private projectService: Project, private branchService: Branch, private userServ: User, private router: Router, private toast: ToastService) {}

  ngOnInit() {
    this.branchService.currentBranch$.subscribe(branch => {
      this.currentBranch.set(branch);
      this.loadProjects(1);
    });
  }

  loadProjects(page: number, branchName: string = this.currentBranch()) {
    this.isLoading.set(true);
    this.projectService.getProjects(page, branchName).subscribe((res: any) => {
      if (res.projects.length === 0 && page > 1) {
        this.loadProjects(page - 1, branchName);
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
      this.projectsList.set(res.projects);
      console.log('Loaded Projects: ', res.projects);
      this.itemsPerPage.set(res.projects.length);
      this.currentPage.set(page);
      this.isLoading.set(false);
    });
  }

  openNewProjectModal() {
    this.projectModal.open();
  }

  openViewProjectModal(project: IProject) {
    this.viewModal.open(project);
  }

  updateProject(submitedProject: any) {
    console.log('Submited Project ID: ', submitedProject.id);
    if(submitedProject.newAttachments.getAll('files').length === 0 && submitedProject.newDocument.getAll('files').length > 0){
      this.userServ.uploadFiles(submitedProject.newDocument).subscribe({
        next: (imgUploadRes: any) => {
          const document = imgUploadRes.links;
          if (!Array.isArray(submitedProject.currentDocument)) {
            submitedProject.currentDocument = submitedProject.currentDocument ? submitedProject.currentDocument.split(/,(?=\/uploads\/center\/)/) : [];
          }
          submitedProject.currentDocument = [
            ...submitedProject.currentDocument,
            ...document
          ].join(',');
          const newProject: IProject = {
            tenantId: submitedProject.tenantId,
            name: submitedProject.name,
            totalBudget: submitedProject.totalBudget,
            terms: submitedProject.terms,
            managers: submitedProject.managers,
            workers: submitedProject.workers,
            document: submitedProject.currentDocument,
            attachments: submitedProject.currentAttachments
          };
          console.log('New Project Data: ', newProject);
          this.projectService.updateProject(submitedProject.id!, newProject).subscribe((res: any) => {
            this.toast.show('Project updated successfully', 'success');
            // Force route reload
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/projects']);
            });
          });
        },
        error: (err: any) => { console.error('Document upload error: ', err); }
      });
    }
    else if (submitedProject.newDocument.getAll('files').length === 0 && submitedProject.newAttachments.getAll('files').length > 0){
      this.userServ.uploadFiles(submitedProject.newAttachments).subscribe({
        next: (uploadRes: any) => {
          const attachments = uploadRes.links;
          if (!Array.isArray(submitedProject.currentAttachments)) {
            submitedProject.currentAttachments = submitedProject.currentAttachments ? submitedProject.currentAttachments.split(/,(?=\/uploads\/center\/)/) : [];
          }
          submitedProject.currentAttachments = [
            ...submitedProject.currentAttachments,
            ...attachments
          ].join(',');
          const newProject: IProject = {
            tenantId: submitedProject.tenantId,
            name: submitedProject.name,
            totalBudget: submitedProject.totalBudget,
            terms: submitedProject.terms,
            managers: submitedProject.managers,
            workers: submitedProject.workers,
            document: submitedProject.currentDocument,
            attachments: submitedProject.currentAttachments
          };
          console.log('New Project Data: ', newProject);
          this.projectService.updateProject(submitedProject.id!, newProject).subscribe((res: any) => {
            this.toast.show('Project updated successfully', 'success');
            // Force route reload
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/projects']);
            });
          });
        },
        error: (err: any) => { console.error('Attachments upload error: ', err); }
      });
    }
    else if (submitedProject.newDocument.getAll('files').length === 0 && submitedProject.newAttachments.getAll('files').length === 0){
      const newProject: IProject = {
        tenantId: submitedProject.tenantId,
        name: submitedProject.name,
        totalBudget: submitedProject.totalBudget,
        terms: submitedProject.terms,
        managers: submitedProject.managers,
        workers: submitedProject.workers,
        document: submitedProject.currentDocument,
        attachments: submitedProject.currentAttachments
      };
      this.projectService.updateProject(submitedProject.id!, newProject).subscribe((res: any) => {
        this.toast.show('Project updated successfully', 'success');
        // Force route reload
        console.log('Updated Project: ', res);
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/projects']);
        });
      });
    }
    else{
      this.userServ.uploadFiles(submitedProject.newAttachments).subscribe({
        next: (uploadRes: any) => {
          const attachments = uploadRes.links;
          if (!Array.isArray(submitedProject.currentAttachments)) {
            submitedProject.currentAttachments = submitedProject.currentAttachments ? submitedProject.currentAttachments.split(/,(?=\/uploads\/center\/)/) : [];
          }
          submitedProject.currentAttachments = [
            ...submitedProject.currentAttachments,
            ...attachments
          ].join(',');
          this.userServ.uploadFiles(submitedProject.newDocument).subscribe({
            next: (imgUploadRes: any) => {
              const document = imgUploadRes.links;
              if (!Array.isArray(submitedProject.currentDocument)) {
                submitedProject.currentDocument = submitedProject.currentDocument ? submitedProject.currentDocument.split(/,(?=\/uploads\/center\/)/) : [];
              }
              submitedProject.currentDocument = [
                ...submitedProject.currentDocument,
                ...document
              ].join(',');
              const newProject: IProject = {
                tenantId: submitedProject.tenantId,
                name: submitedProject.name,
                totalBudget: submitedProject.totalBudget,
                terms: submitedProject.terms,
                managers: submitedProject.managers,
                workers: submitedProject.workers,
                document: submitedProject.currentDocument,
                attachments: submitedProject.currentAttachments
              };
              this.projectService.updateProject(submitedProject.id!, newProject).subscribe((res: any) => {
                this.toast.show('Project updated successfully', 'success');
                // Force route reload
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                  this.router.navigate(['/projects']);
                });
              });
            },
            error: (err: any) => { console.error('Document upload error: ', err); }
          });
        },
        error: (err: any) => { console.error('Attachments upload error: ', err); }
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

  saveNewProject(submitedProject: any) {
    if(submitedProject.attachments.getAll('files').length === 0 && submitedProject.document.getAll('files').length > 0){
      this.userServ.uploadFiles(submitedProject.document).subscribe({
        next: (imgUploadRes: any) => {
          const document = imgUploadRes.links;
          const newProject: IProject = {
            tenantId: submitedProject.tenantId,
            name: submitedProject.name,
            totalBudget: submitedProject.totalBudget,
            document: this.handleAttachmentsList(document),
            terms: submitedProject.terms,
            managers: submitedProject.managers,
            workers: submitedProject.workers,
            attachments: '',
          };
          this.projectService.createProject(newProject).subscribe((res: any) => {
            this.toast.show('Project created successfully', 'success');
            // Force route reload
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/projects']);
            });
          });
        },
        error: (err: any) => { console.error('Document upload error: ', err); }
      });
    }
    else if (submitedProject.document.getAll('files').length === 0 && submitedProject.attachments.getAll('files').length > 0){
      this.userServ.uploadFiles(submitedProject.attachments).subscribe({
        next: (uploadRes: any) => {
          const attachments = uploadRes.links;
          const newProject: IProject = {
            tenantId: submitedProject.tenantId,
            name: submitedProject.name,
            totalBudget: submitedProject.totalBudget,
            document: '',
            terms: submitedProject.terms,
            managers: submitedProject.managers,
            workers: submitedProject.workers,
            attachments: this.handleAttachmentsList(attachments),
          };
          this.projectService.createProject(newProject).subscribe((res: any) => {
            this.toast.show('Project created successfully', 'success');
            // Force route reload
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/projects']);
            });
          });
        },
        error: (err: any) => { console.error('Attachments upload error: ', err); }
      });
    }
    else if (submitedProject.document.getAll('files').length === 0 && submitedProject.attachments.getAll('files').length === 0){
      const newProject: IProject = {
        tenantId: submitedProject.tenantId,
        name: submitedProject.name,
        totalBudget: submitedProject.totalBudget,
        document: '',
        terms: submitedProject.terms,
        managers: submitedProject.managers,
        workers: submitedProject.workers,
        attachments: '',
      };
      this.projectService.createProject(newProject).subscribe((res: any) => {
        this.toast.show('Project created successfully', 'success');
        // Force route reload
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/projects']);
        });
      });
    }
    else{
      this.userServ.uploadFiles(submitedProject.attachments).subscribe({
        next: (uploadRes: any) => {
          const attachments = uploadRes.links;
          this.userServ.uploadFiles(submitedProject.document).subscribe({
            next: (imgUploadRes: any) => {
              const document = imgUploadRes.links;
              const newProject: IProject = {
                tenantId: submitedProject.tenantId,
                name: submitedProject.name,
                totalBudget: submitedProject.totalBudget,
                document: this.handleAttachmentsList(document),
                terms: submitedProject.terms,
                managers: submitedProject.managers,
                workers: submitedProject.workers,
                attachments: this.handleAttachmentsList(attachments),
              };
              this.projectService.createProject(newProject).subscribe((res: any) => {
                this.toast.show('Project created successfully', 'success');
                // Force route reload
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                  this.router.navigate(['/projects']);
                });
              });
            },
            error: (err: any) => { console.error('Document upload error: ', err); }
          });
        },
        error: (err: any) => { console.error('Attachments upload error: ', err); }
      });
    }
  }

  deleteProject(projectId: string | undefined){
    if (!projectId) {
      // Remove first element in taskList
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res){
          this.projectsList.update(list => list.slice(1));
          this.toast.show('Project deleted successfully', 'success');
        }
      });
    }
    else{
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res){
          this.projectService.deleteProject(projectId).subscribe(() => {
            this.toast.show('Project deleted successfully', 'success');
            this.projectsList.update(list => list.filter(proj => proj.id !== projectId));
          });
        }
      });
    }
  }

}
