import { Component, EventEmitter, OnDestroy, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { IRecruitment, IRequirement, recruitmentStatus } from '../../interfaces/IRecruitment';
import { TranslateModule } from '@ngx-translate/core';
import { Department } from '../../services/department';
import { Branch } from '../../services/branch';
import { IDepartment } from '../../interfaces/IDepartment';
import { Subscription } from 'rxjs';
import { IUser } from '../../interfaces/IUser';

@Component({
  selector: 'app-new-recruitment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './new-recruitment-modal.html',
  styleUrls: ['./new-recruitment-modal.scss', '../../../styles.scss']
})
export class NewRecruitmentModal implements OnDestroy {
  isOpen = signal(false);
  @Output() save = new EventEmitter<IRecruitment>();
  attachments: File[] = [];
  requirments: IRequirement[] = [];
  status = recruitmentStatus;
  departments = signal<IDepartment[]>([]);
  currentBranch = signal<string>('');
  currentUser = signal<IUser | null>(null);
  private branchSub?: Subscription;

  constructor(private branchService: Branch, private departmentService: Department) {
    this.requirments.push({ title: '', description: '', mandatory: true });
  }

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

  addRequirment() {
    this.requirments.push({ title: '', description: '', mandatory: true });
  }

  removeRequirment(index: number) {
    this.requirments.splice(index, 1);
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
      const NewRecruitment: any = {
        tenantId: this.currentBranch(),
        position: form.value.position,
        description: form.value.description,
        departmentId: form.value.department.id,
        attachments: formData,
        createdById: this.currentUser()?.employee?.id,
        requirements: this.requirments,
        active: true,
        applications: [],
        status: this.status.OPEN,
        createdAt: new Date()
      };
      this.save.emit(NewRecruitment);
      this.close();
      form.resetForm();
      this.attachments = [];
    }
  }

  ngOnDestroy() {
    this.branchSub?.unsubscribe();
  }
}
