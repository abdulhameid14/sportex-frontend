import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IUserPerformance } from '../../interfaces/IUserPerformance';
import { Branch } from '../../services/branch';
import { UserPerformance } from '../../services/user-performance';
import { IEmployee } from '../../interfaces/IEmployee';
import { IUser } from '../../interfaces/IUser';
import { Toast } from '../toast/toast';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-emp-performance-modal',
  standalone: true,
  imports: [CommonModule, Toast, FormsModule, TranslateModule],
  templateUrl: './emp-performance-modal.html',
  styleUrls: ['./emp-performance-modal.scss', '../../../styles.scss']
})
export class EmpPerformanceModal {
  @Input() employee: IEmployee | null = null;
  isOpen = signal(false);
  goals: { title: string, description: string, status: string, comments: string }[] = [];
  feedbacks: { from: string, comments: string }[] = [];
  currentBranch = signal<string>('');
  currentUser = signal<IUser | null>(null);
  currentYear: number = new Date().getFullYear();
  reviewPeriodLabel: string = '';
  isLoading = signal(false);

  constructor(
    private branchServ: Branch,
    private userPerformanceServ: UserPerformance,
    private toast: ToastService
  ){
    this.goals.push({ title: '', description: '', status: '', comments: '' });
    this.feedbacks.push({ from: '', comments: '' });
  }

  open(employee: IEmployee) {
    this.employee = { ...employee };
    this.isOpen.set(true);
    this.branchServ.currentBranch$.subscribe( branch => {
      this.currentBranch.set(branch);
    }
    );
    this.branchServ.currentUser$.subscribe( user => {
      this.currentUser.set(user);
    });
  }

  close() {
    this.isOpen.set(false);
    this.goals = [{ title: '', description: '', status: '', comments: '' }];
    this.feedbacks = [{ from: '', comments: '' }];
  }

  addGoal() {
    this.goals.push({ title: '', description: '', status: '', comments: '' });
  }

  removeGoal(index: number) {
    this.goals.splice(index, 1);
  }

  addFeedback() {
    this.feedbacks.push({ from: '', comments: '' });
  }

  removeFeedback(index: number) {
    this.feedbacks.splice(index, 1);
  }

  submit(form: NgForm) {
    if (form.valid) {
      this.isLoading.set(true);
      switch (form.value.reviewPeriod) {
        case 1:
          this.reviewPeriodLabel = `${this.currentYear} First Quarter`;
          break;
        case 2:
          this.reviewPeriodLabel = `${this.currentYear} Second Quarter`;
          break;
        case 3:
          this.reviewPeriodLabel = `${this.currentYear} Third Quarter`;
          break;
        case 4:
          this.reviewPeriodLabel = `${this.currentYear} Fourth Quarter`;
          break;
      }
      const newEmpPerformance: IUserPerformance = {
        tenantId: this.employee?.tenantId,
        employeeId: this.employee?.id!,
        ratifiedById: this.currentUser()?.id,
        reviewPeriod: this.reviewPeriodLabel,
        rating: Number(form.value.rating),
        feedback: this.feedbacks.map(feedback => ({
          from: this.currentUser()?.employee?.name!,
          comments: feedback.comments
        })),
        goals: this.goals.map(goal => ({
          title: goal.title,
          description: goal.description,
          status: goal.status,
          comments: goal.comments
        })),
      };
      console.log('Submitting Employee Performance: ', newEmpPerformance);
      this.userPerformanceServ.createUserPerformance(newEmpPerformance).subscribe( res => {
        this.toast.show('Review submitted successfully', 'success');
        this.isLoading.set(false);
      });
      this.close();
      form.resetForm();
    }
  }
}
