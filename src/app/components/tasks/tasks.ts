import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { DeleteValidationModal } from './../delete-validation-modal/delete-validation-modal';
import { NewTaskModal } from './../new-task-modal/new-task-modal';
import { ViewTaskModal } from './../view-task-modal/view-task-modal';
import { Task } from '../../services/task.js';
import { ITask, taskStatus } from '../../interfaces/ITask';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationButton } from "../pagination-button/pagination-button";
import { Branch } from '../../services/branch';
import { User } from '../../services/user';
import { HasPermissionDirective } from '../../directives/has-permission';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskSubmitModal } from '../task-submit-modal/task-submit-modal';
import { HasAnyPermissionDirective } from '../../directives/hasAnyPermission';
import { SkeletonTable } from '../skeleton-table/skeleton-table';
import { Toast } from '../toast/toast';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [NewTaskModal, Toast, SkeletonTable, HasAnyPermissionDirective, ViewTaskModal, TaskSubmitModal, DatePipe, DeleteValidationModal, CommonModule, TranslateModule, PaginationButton, HasPermissionDirective, FormsModule],
  templateUrl: './tasks.html',
  styleUrls: ['./tasks.scss', '../../../styles.scss']
})
export class Tasks implements OnInit {
  //activeTab = signal<string>('tasks');
  isLoading = signal<boolean>(true);
  @ViewChild(NewTaskModal) taskModal!: NewTaskModal;
  @ViewChild(ViewTaskModal) viewModal!: ViewTaskModal;
  @ViewChild(TaskSubmitModal) submitModal!: TaskSubmitModal;
  @ViewChild(DeleteValidationModal) deleteModal!: DeleteValidationModal;
  taskStatus = taskStatus;
  taskList = signal<ITask[]>([]);
  allTasks = signal<ITask[]>([]);
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(0);
  currentBranch = signal<string>('');
  lastPageReached = signal(false);
  lastPage = signal(10000); // Set initial large number
  filteredStatus = signal<string>('ALL');

  constructor(private taskService: Task, private toast: ToastService, private branchService: Branch, private userServ: User, private router: Router) { }

  ngOnInit() {
    this.branchService.currentBranch$.subscribe(branch => {
      this.currentBranch.set(branch);
      this.loadTasks(1);
    });
  }

  loadTasks(currentPage: number, branchName: string = this.currentBranch(), status: string = this.filteredStatus()) {
    this.isLoading.set(true);
    this.taskService.getTasks(currentPage, branchName, status).subscribe((res: any) => {
      if (res.tasks.length === 0 && currentPage > 1) {
        this.loadTasks(currentPage - 1, branchName);
        this.lastPageReached.set(true);
        this.lastPage.set(currentPage - 1);
        this.isLoading.set(false);
        return;
      }
      if (currentPage === this.lastPage()) {
        this.lastPageReached.set(true);
      } else {
        this.lastPageReached.set(false);
      }
      this.allTasks.set(res.tasks);
      this.taskList.set(res.tasks);
      this.itemsPerPage.set(res.tasks.length);
      this.currentPage.set(currentPage);
      this.isLoading.set(false);
    });
  }

  applyFilter() {
    this.loadTasks(1, this.currentBranch(), this.filteredStatus());
  }

  openNewTaskModal() {
    this.taskModal.open();
  }

  openViewTaskModal(task: ITask) {
    this.viewModal.open(task);
  }

  openTaskSubmitModal(task: ITask) {
    this.submitModal.open(task);
  }

  taskSubmited(isClosed: any) {
    if (isClosed) {
      setTimeout(() => {
        this.toast.show('Task submitted successfully', 'success');
        // Force route reload
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/tasks']);
        });
      }, 500);
    }
  }

  handleAttachmentsList(list: string[]): string {
    let attachments: string = '';
    for (let i = 0; i < list.length; i++) {
      attachments += list[i] + ',';
    }
    return attachments.slice(0, -1);
  }

  saveNewTask(submitedTask: any) {
    if (submitedTask.attachments.getAll('files').length === 0 && submitedTask.submissionAttachments.getAll('files').length === 0) {
      const newTask: ITask = {
        tenantId: submitedTask.tenantId,
        title: submitedTask.title,
        description: submitedTask.description,
        priority: submitedTask.priority,
        departmentId: submitedTask.departmentId,
        status: submitedTask.status,
        createdByEmployeeId: submitedTask.createdByEmployeeId,
        assignedToEmployeeId: submitedTask.assignedToEmployeeId,
        consultantEmployeeId: submitedTask.consultantEmployeeId,
        attachments: '',
        submissionAttachments: '',
        deadline: submitedTask.deadline
      };
      this.taskService.createTask(newTask).subscribe((res: any) => {
        this.toast.show('Task created successfully', 'success');
        // Force route reload
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/tasks']);
        });
      });
    }
    else if (submitedTask.attachments.getAll('files').length === 0 && submitedTask.submissionAttachments.getAll('files').length > 0) {
      this.userServ.uploadFiles(submitedTask.submissionAttachments).subscribe({
        next: (uploadRes: any) => {
          const subAttachments = uploadRes.links;
          const newTask: ITask = {
            tenantId: submitedTask.tenantId,
            title: submitedTask.title,
            description: submitedTask.description,
            priority: submitedTask.priority,
            departmentId: submitedTask.departmentId,
            status: submitedTask.status,
            createdByEmployeeId: submitedTask.createdByEmployeeId,
            assignedToEmployeeId: submitedTask.assignedToEmployeeId,
            consultantEmployeeId: submitedTask.consultantEmployeeId,
            attachments: '',
            submissionAttachments: this.handleAttachmentsList(subAttachments),
            deadline: submitedTask.deadline
          };
          this.taskService.createTask(newTask).subscribe((res: any) => {
            this.toast.show('Task created successfully', 'success');
            // Force route reload
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/tasks']);
            });
          });
        },
        error: (err: any) => {
          console.error('Error uploading files: ', err);
        }
      });
    }
    else if (submitedTask.attachments.getAll('files').length > 0 && submitedTask.submissionAttachments.getAll('files').length === 0) {
      this.userServ.uploadFiles(submitedTask.attachments).subscribe({
        next: (uploadRes: any) => {
          const attachments = uploadRes.links;
          const newTask: ITask = {
            tenantId: submitedTask.tenantId,
            title: submitedTask.title,
            description: submitedTask.description,
            priority: submitedTask.priority,
            departmentId: submitedTask.departmentId,
            status: submitedTask.status,
            createdByEmployeeId: submitedTask.createdByEmployeeId,
            assignedToEmployeeId: submitedTask.assignedToEmployeeId,
            consultantEmployeeId: submitedTask.consultantEmployeeId,
            attachments: this.handleAttachmentsList(attachments),
            submissionAttachments: '',
            deadline: submitedTask.deadline
          };
          this.taskService.createTask(newTask).subscribe((res: any) => {
            this.toast.show('Task created successfully', 'success');
            // Force route reload
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/tasks']);
            });
          });
        },
        error: (err: any) => {
          console.error('Error uploading files: ', err);
        }
      });
    }
    else {
      this.userServ.uploadFiles(submitedTask.attachments).subscribe({
        next: (uploadRes: any) => {
          const attachments = uploadRes.links;
          this.userServ.uploadFiles(submitedTask.submissionAttachments).subscribe({
            next: (subUploadRes: any) => {
              const subAttachments = subUploadRes.links;
              const newTask: ITask = {
                tenantId: submitedTask.tenantId,
                title: submitedTask.title,
                description: submitedTask.description,
                priority: submitedTask.priority,
                departmentId: submitedTask.departmentId,
                status: submitedTask.status,
                createdByEmployeeId: submitedTask.createdByEmployeeId,
                assignedToEmployeeId: submitedTask.assignedToEmployeeId,
                consultantEmployeeId: submitedTask.consultantEmployeeId,
                attachments: this.handleAttachmentsList(attachments),
                submissionAttachments: this.handleAttachmentsList(subAttachments),
                deadline: submitedTask.deadline
              };
              this.taskService.createTask(newTask).subscribe((res: any) => {
                this.toast.show('Task created successfully', 'success');
                // Force route reload
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                  this.router.navigate(['/tasks']);
                });
              });
            },
            error: (err: any) => {
              console.error('Error uploading submission files: ', err);
            }
          });
        },
        error: (err: any) => {
          console.error('Error uploading files: ', err);
        }
      });
    }
  }

  updateTask(task: any) {
    console.log('Updating Task from page: ', task);
    if (task.updatedAttachments.getAll('files').length === 0 && task.updatedSubAttachments.getAll('files').length === 0) {
      const updatedTask: any = {
        title: task.title,
        tenantId: task.tenantId,
        description: task.description,
        priority: task.priority,
        departmentId: task.departmentId,
        status: task.status,
        assignedToEmployeeId: task.assignedToEmployeeId,
        consultantEmployeeId: task.consultantEmployeeId,
        deadline: task.deadline,
        attachments: task.currentAttachments,
        submissionAttachments: task.currentSubAttachments,
      };
      console.log('Final updated task: ', updatedTask);
      this.taskService.updateTask(task.id!, updatedTask).subscribe((res: any) => {
        this.toast.show('Task updated successfully', 'success');
        // Force route reload
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/tasks']);
        });
      });
    }
    else if (task.updatedAttachments.getAll('files').length > 0 && task.updatedSubAttachments.getAll('files').length === 0) {
      this.userServ.uploadFiles(task.updatedAttachments).subscribe({
        next: (uploadRes: any) => {
          const attachments = uploadRes.links;
          if (!Array.isArray(task.currentAttachments)) {
            task.currentAttachments = task.currentAttachments ? task.currentAttachments.split(/,(?=\/uploads\/center\/)/) : [];
          }
          task.currentAttachments = [
            ...task.currentAttachments,
            ...attachments
          ].join(',');
          const updatedTask: any = {
            title: task.title,
            tenantId: task.tenantId,
            description: task.description,
            priority: task.priority,
            departmentId: task.departmentId,
            status: task.status,
            assignedToEmployeeId: task.assignedToEmployeeId,
            deadline: task.deadline,
            attachments: task.currentAttachments,
            submissionAttachments: task.currentSubAttachments,
          };
          console.log('Final updated task: ', updatedTask);
          this.taskService.updateTask(task.id!, updatedTask).subscribe((res: any) => {
            this.toast.show('Task updated successfully', 'success');
            // Force route reload
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/tasks']);
            });
          });
        },
        error: (err: any) => {
          console.error('Error uploading attachments: ', err);
        }
      });
    }
    else if (task.updatedAttachments.getAll('files').length === 0 && task.updatedSubAttachments.getAll('files').length > 0) {
      this.userServ.uploadFiles(task.updatedSubAttachments).subscribe({
        next: (uploadRes: any) => {
          const subAttachments = uploadRes.links;
          if (!Array.isArray(task.currentSubAttachments)) {
            task.currentSubAttachments = task.currentSubAttachments ? task.currentSubAttachments.split(/,(?=\/uploads\/center\/)/) : [];
          }
          task.currentSubAttachments = [
            ...task.currentSubAttachments,
            ...subAttachments
          ].join(',');
          const updatedTask: any = {
            title: task.title,
            tenantId: task.tenantId,
            description: task.description,
            priority: task.priority,
            departmentId: task.departmentId,
            status: task.status,
            assignedToEmployeeId: task.assignedToEmployeeId,
            deadline: task.deadline,
            attachments: task.currentAttachments,
            submissionAttachments: task.currentSubAttachments,
          };
          console.log('Final updated task: ', updatedTask);
          this.taskService.updateTask(task.id!, updatedTask).subscribe((res: any) => {
            this.toast.show('Task updated successfully', 'success');
            // Force route reload
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/tasks']);
            });
          });
        },
        error: (err: any) => {
          console.error('Error uploading sub attachments: ', err);
        }
      });
    }
    else {
      this.userServ.uploadFiles(task.updatedSubAttachments).subscribe({
        next: (uploadRes: any) => {
          console.log('Sub attachments upload response: ', uploadRes);
          const subAttachments = uploadRes.links;
          if (!Array.isArray(task.currentSubAttachments)) {
            task.currentSubAttachments = task.currentSubAttachments ? task.currentSubAttachments.split(/,(?=\/uploads\/center\/)/) : [];
          }
          task.currentSubAttachments = [
            ...task.currentSubAttachments,
            ...subAttachments
          ].join(',');
          this.userServ.uploadFiles(task.updatedAttachments).subscribe({
            next: (uploadRes2: any) => {
              console.log('Attachments upload response: ', uploadRes2);
              const attachments = uploadRes2.links;
              if (!Array.isArray(task.currentAttachments)) {
                task.currentAttachments = task.currentAttachments ? task.currentAttachments.split(/,(?=\/uploads\/center\/)/) : [];
              }
              task.currentAttachments = [
                ...task.currentAttachments,
                ...attachments
              ].join(',');
              const updatedTask: any = {
                title: task.title,
                tenantId: task.tenantId,
                description: task.description,
                priority: task.priority,
                departmentId: task.departmentId,
                status: task.status,
                assignedToEmployeeId: task.assignedToEmployeeId,
                deadline: task.deadline,
                attachments: task.currentAttachments,
                submissionAttachments: task.currentSubAttachments,
              };
              console.log('Final updated task: ', updatedTask);
              this.taskService.updateTask(task.id!, updatedTask).subscribe((res: any) => {
                this.toast.show('Task updated successfully', 'success');
                // Force route reload
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                  this.router.navigate(['/tasks']);
                });
              });
            },
            error: (err: any) => {
              console.error('Error uploading attachments: ', err);
            }
          });
        },
        error: (err: any) => {
          console.error('Error uploading sub attachments: ', err);
        }
      });
    }
  }

  deleteTask(taskId: string | undefined) {
    if (!taskId) {
      // Remove first element in taskList
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res) {
          this.toast.show('Task deleted successfully', 'success');
          this.taskList.update(list => list.slice(1));
        }
      });
    }
    else {
      this.deleteModal.open();
      this.deleteModal.confirm.subscribe(res => {
        if (res) {
          this.taskService.deleteTask(taskId).subscribe(() => {
            this.toast.show('Task deleted successfully', 'success');
            this.taskList.update(list => list.filter(task => task.id !== taskId));
          });
        }
      });
    }
  }

}
