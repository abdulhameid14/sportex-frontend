import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IDepartment } from '../../interfaces/IDepartment.js';
import { Subscription } from 'rxjs';
import { Branch } from '../../services/branch.js';
import { Department } from '../../services/department.js';
import { IBranch } from '../../interfaces/IBranch.js';
import { HasPermissionDirective } from '../../directives/has-permission.js';

@Component({
  selector: 'app-view-branch-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, HasPermissionDirective],
  templateUrl: './view-branch-modal.html',
  styleUrls: ['./view-branch-modal.scss', '../../../styles.scss']
})
export class ViewBranchModal {
  branch = signal<IBranch | null>(null);
  @Output() update = new EventEmitter<IBranch>();
  @Output() closed = new EventEmitter<void>();
  private branchOriginal!: IBranch;
  isOpen = signal(false);
  editMode = signal(false);
  departments = signal<IDepartment[]>([]);
  private branchSub?: Subscription;

  constructor(private branchService: Branch, private departmentService: Department) {
  }

  open(branch: IBranch) {
    console.log('Opening view branch modal for branch:', branch);
    this.branch.set({ ...branch });
    this.branchOriginal = { ...branch };
    this.isOpen.set(true);
    this.editMode.set(false);
    this.branchSub = this.branchService.currentBranch$.subscribe(branchName => {
      if (branchName) {
        this.departmentService.getDepartmentsByBranch(branchName).subscribe((res: any) => {
          this.departments.set(res.departments);
        });
        // Unsubscribe after loading once
        this.branchSub?.unsubscribe();
      }
    });
  }

  close() {
    this.isOpen.set(false);
    this.closed.emit();
  }

  enableEdit() {
    this.editMode.set(true);
  }

  cancelChanges() {
    if (this.branch) {
      this.branch.set(this.branchOriginal);
    }
    this.editMode.set(false);
  }

  saveChanges() {
    if (this.branch()) {
      console.log('Saving branch from modal:', this.branch());
      this.update.emit(this.branch()!);
      this.close();
    }
  }
}
