import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IGoal, IStrategy } from '../../interfaces/IStrategy.js';
import { IDepartment } from '../../interfaces/IDepartment.js';
import { Branch } from '../../services/branch.js';
import { Department } from '../../services/department.js';
import { HasPermissionDirective } from '../../directives/has-permission.js';
import { IBranch } from '../../interfaces/IBranch.js';

@Component({
  selector: 'app-view-strategy-modal',
  imports: [CommonModule, FormsModule, TranslateModule, HasPermissionDirective],
  standalone: true,
  templateUrl: './view-strategy-modal.html',
  styleUrls: ['./view-strategy-modal.scss', '../../../styles.scss']
})
export class ViewStrategyModal {
  @Output() update = new EventEmitter<IStrategy>();
  @Output() closed = new EventEmitter<void>();
  isOpen = signal(false);
  editMode = signal(false);
  departments = signal<IDepartment[]>([]);
  branches = signal<IBranch[]>([]);
  strategy = signal<IStrategy | null>(null);
  updatedTitle: string = '';
  updatedDescription: string = '';
  updatedDepartmentId: string = '';
  updatedBranch: string = '';
  updatedBudget: number | null = null;
  updatedActive: boolean | null = null;
  updatedGoals: IGoal[] = [];
  newAttachments: File[] = [];
  currentAttachments = signal<string[]>([]);

  constructor(private branchService: Branch, private departmentService: Department) {}

  open(strategy: IStrategy) {
    console.log('Opening strategy modal with strategy:', strategy);
    this.strategy.set({ ...strategy });
    this.resetAll();
    this.isOpen.set(true);
    this.editMode.set(false);
    this.branchService.currentBranch$.subscribe(branchName => {
      if (branchName) {
        this.departmentService.getDepartmentsByBranch(branchName).subscribe((res: any) => {
          this.departments.set(res.departments);
        });
        this.branchService.getAllBranches().subscribe((res: any) => {
          this.branches.set(res.tenants);
        });
      }
    });
  }

resetAll() {
  if (!this.strategy()) return;
  this.updatedTitle = this.strategy()!.title!;
  this.updatedDescription = this.strategy()!.description!;
  this.updatedDepartmentId = this.strategy()!.departmentId!;
  this.updatedBranch = this.strategy()!.tenantId!;
  this.updatedBudget = this.strategy()!.budget;
  this.updatedActive = this.strategy()!.active;
  this.updatedGoals = [...(this.strategy()!.goals ?? [])];
  this.newAttachments = [];
  this.currentAttachments.set(this.attachments);
}


  close() {
    this.isOpen.set(false);
    this.resetAll();
    this.closed.emit();
  }

  enableEdit() {
    this.editMode.set(true);
  }

  cancelChanges() {
    this.resetAll();
    this.editMode.set(false);
  }

  addGoal() {
    this.updatedGoals.push({ name: '', description: '', deadline: undefined, budget: 0, expenses: 0, reach: 0 });
  }

  removeGoal(index: number) {
    this.updatedGoals.splice(index, 1);
  }

  // Separate methods to split attachment and document string to array of strings
  get attachments(): string[] {
    return this.strategy()?.attachments ? this.strategy()!.attachments!.split(/,(?=\/uploads\/center\/)/) : [];
  }

  removeNewAttachment(index: number) {
    this.newAttachments.splice(index, 1);
  }

  removeCurrentAttachment(index: number) {
    this.currentAttachments.set(this.currentAttachments().filter((_, i) => i !== index));
  }

  handleAttachmentInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.newAttachments = [...input.files];
    }
    input.value = ''; // reset input field
  }

  saveChanges() {
    if (this.strategy) {
      if (this.updatedGoals.length > 0 && this.updatedGoals[this.updatedGoals.length - 1].name === '') {
        this.removeGoal(this.updatedGoals.length - 1);
      }
      const attach = new FormData();
      this.newAttachments.forEach(file => {
        attach.append('files', file);
      });
      const updatedStrategy: any = {
        id: this.strategy()!.id,
        tenantId: this.updatedBranch ? this.updatedBranch : this.strategy()!.tenantId,
        title: this.updatedTitle ? this.updatedTitle : this.strategy()!.title,
        description: this.updatedDescription ? this.updatedDescription : this.strategy()!.description,
        departmentId: this.updatedDepartmentId ? this.updatedDepartmentId : this.strategy()!.departmentId,
        budget: this.updatedBudget !== null ? this.updatedBudget : this.strategy()!.budget,
        active: this.updatedActive !== null ? this.updatedActive : this.strategy()!.active,
        goals: this.updatedGoals,
        newAttachments: attach,
        currentAttachments: this.currentAttachments().join(',')
      };
      console.log('Saving strategy from modal:', updatedStrategy);
      this.update.emit(updatedStrategy);
      this.close();
    }
  }
}
