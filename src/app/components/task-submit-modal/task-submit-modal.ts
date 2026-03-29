import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ITask, taskStatus } from '../../interfaces/ITask.js';
import { Task } from '../../services/task.js';
import { User } from '../../services/user.js';

@Component({
  selector: 'app-task-submit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './task-submit-modal.html',
  styleUrls: ['./task-submit-modal.scss', '../../../styles.scss']
})
export class TaskSubmitModal {
  @Output() closed = new EventEmitter<boolean>();
  isOpen = signal(false);
  task = signal<ITask | null>(null);
  updatedSubAttachments: File[] = [];

  constructor(private taskService: Task, private userService: User) {}

  open(task: ITask) {
    // Copy the task to avoid mutating the original object
    this.task.set(task);
    // Initialize updated fields
    this.resetAllFields();
    this.isOpen.set(true);
  }

  resetAllFields() {
    // Reset all fields
    if (!this.task) return;
    this.updatedSubAttachments = [];
  }

  close() {
    this.isOpen.set(false);
    this.resetAllFields();
    this.closed.emit(true);
  }

  cancelChanges() {
    this.resetAllFields();
  }

  get submissionAttachments(): string[] {
    return this.task()?.submissionAttachments ? this.task()!.submissionAttachments!.split(/,(?=\/uploads\/center\/)/) : [];
  }

  removeNewSubAttachment(index: number) {
    this.updatedSubAttachments.splice(index, 1);
  }

  handleSubAttachmentInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.updatedSubAttachments = [...input.files];
    }
    input.value = ''; // reset input field
  }

  saveChanges() {
    if (this.task()) {
      const submissionAttachments = new FormData();
      this.updatedSubAttachments.forEach(file => {
        submissionAttachments.append('files', file);
      });
      this.userService.uploadFiles(submissionAttachments).subscribe((res: any) => {
        console.log('Files uploaded successfully:', res);
        const subAttachment = res.links;
        this.taskService.submitTask(this.task()!.id!, subAttachment).subscribe((res: any) => {
          console.log('Task submitted successfully:', res);
          this.taskService.updateTaskStatus(this.task()!.id!, taskStatus.SUBMITTED).subscribe((res: any) => {
            console.log('Task status updated successfully:', res);
          });
        });
      });
      this.close();
    }
  }
}
