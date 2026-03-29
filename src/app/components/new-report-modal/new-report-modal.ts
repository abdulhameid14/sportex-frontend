import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { IUser } from '../../interfaces/IUser';
import { Department } from '../../services/department';
import { Branch } from '../../services/branch';
import { IDepartment } from '../../interfaces/IDepartment';
import { reportType } from '../../interfaces/IReport';

@Component({
  selector: 'app-new-report-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './new-report-modal.html',
  styleUrls: ['./new-report-modal.scss', '../../../styles.scss']
})
export class NewReportModal {
  isOpen = signal(false);
  @Output() save = new EventEmitter<any>();
  attachments: File[] = [];
  departments = signal<IDepartment[]>([]);
  currentBranch = signal<string>('');
  currentUser = signal<IUser | null>(null);
  private branchSub?: Subscription;
  reportTypes = reportType;

  constructor(private departmentService: Department, private branchService: Branch) {}

  open() {
    this.isOpen.set(true);
    this.branchSub = this.branchService.currentBranch$.subscribe(branchName => {
      if (branchName) {
        this.currentBranch.set(branchName);
        this.departmentService.getDepartmentsByBranch(branchName).subscribe((res: any) => {
          this.departments.set(res.departments);
        });
        this.branchService.currentUser$.subscribe(user => {
          this.currentUser.set(user);
        });
        // Unsubscribe after loading once
        this.branchSub?.unsubscribe();
      }
    });
  }

  close() {
    this.isOpen.set(false);
  }

  removeAttachment(index: number) {
    this.attachments.splice(index, 1);
  }

  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.attachments = [...input.files];
    }
    input.value = ''; // reset input field
  }

  submit(form: NgForm) {
    if (form.valid) {
      const formData = new FormData();
      this.attachments.forEach(file => {
        formData.append('files', file);
      });
      const newReport: any = {
        tenantId: this.currentBranch(),
        title: form.value.title,
        content: form.value.content,
        departmentId: form.value.department.id,
        creatorId: this.currentUser()?.employee?.id,
        attachments: formData,
        data: { reportType: this.reportTypes.Support, reportTypeObject: {} },
        createdAt: new Date(),
        department: { name: form.value.department.name },
        creator: { name: this.currentUser()?.employee?.name }
      };
      this.save.emit(newReport);
      this.close();
      form.resetForm();
      this.attachments = [];
    }
  }
}
