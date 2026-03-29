import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IDepartment } from '../../interfaces/IDepartment';
import { Subscription } from 'rxjs';
import { Branch } from '../../services/branch';

@Component({
  selector: 'app-new-department-modal',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './new-department-modal.html',
  styleUrls: ['./new-department-modal.scss', '../../../styles.scss'],
  standalone: true
})
export class NewDepartmentModal {
  isOpen = signal(false);
  @Output() save = new EventEmitter<IDepartment>();
  currentBranch = signal<string>('');
  private branchSub?: Subscription;

  constructor( private branchService: Branch ) {}

  open() {
    this.isOpen.set(true);
    this.branchSub = this.branchService.currentBranch$.subscribe(branchName => {
      if (branchName) {
        this.currentBranch.set(branchName);
        // Unsubscribe after loading once
        this.branchSub?.unsubscribe();
      }
    });
  }

  close() {
    this.isOpen.set(false);
  }

  submit(form: NgForm) {
    if (form.valid) {
      const newDepartment: any = {
        name: form.value.name,
        tenantId: this.currentBranch()
      };
      this.save.emit(newDepartment);
      this.close();
      form.resetForm();
    }
  }

}
