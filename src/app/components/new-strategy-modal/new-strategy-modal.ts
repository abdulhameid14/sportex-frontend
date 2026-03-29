import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { IStrategy, IGoal } from '../../interfaces/IStrategy';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Branch } from '../../services/branch';
import { IDepartment } from '../../interfaces/IDepartment';
import { Department } from '../../services/department';

@Component({
  selector: 'app-new-strategy-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './new-strategy-modal.html',
  styleUrls: ['./new-strategy-modal.scss', '../../../styles.scss']
})
export class NewStrategyModal {
  isOpen = signal(false);
  @Output() save = new EventEmitter<IStrategy>();
  attachments: File[] = [];
  goals: IGoal[] = [];
  currentBranch = signal<string>('');
  departments = signal<IDepartment[]>([]);
  private branchSub?: Subscription;

  constructor(private branchService: Branch, private departmentService: Department) {
    this.goals.push({ name: '', description: '', deadline: undefined, budget: 0, expenses: 0, reach: 0 });
  }

  open() {
    this.isOpen.set(true);
    this.branchSub = this.branchService.currentBranch$.subscribe(branchName => {
      if (branchName) {
        this.currentBranch.set(branchName);
        this.departmentService.getDepartmentsByBranch(branchName).subscribe((res: any) => {
          console.log('Loaded Departments: ', res.departments);
          this.departments.set(res.departments);
        });
        // Unsubscribe after loading once
        this.branchSub?.unsubscribe();
      }
    });
  }

  close() {
    this.isOpen.set(false);
  }

  addGoal() {
    this.goals.push({ name: '', description: '', deadline: undefined, budget: 0, expenses: 0, reach: 0 });
  }

  removeGoal(index: number) {
    this.goals.splice(index, 1);
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
      const newStrategy: any = {
        tenantId: this.currentBranch(),
        title: form.value.title,
        description: form.value.description,
        goals: this.goals.map(goal => ({
          name: goal.name,
          description: goal.description,
          deadline: goal.deadline,
          budget: goal.budget,
          expenses: goal.expenses,
          reach: goal.reach
        })),
        budget: form.value.budget,
        departmentId: form.value.department.id,
        active: true,
        attachments: formData,
        createdAt: new Date()
      };
      this.save.emit(newStrategy);
      this.close();
      form.resetForm();
      this.attachments = [];
      this.goals = [{ name: '', description: '', deadline: undefined, budget: 0, expenses: 0, reach: 0 }];
    }
  }
}
