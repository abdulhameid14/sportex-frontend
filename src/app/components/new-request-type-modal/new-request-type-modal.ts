import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { IRequestType } from '../../interfaces/IRequest';
import { TranslateModule } from '@ngx-translate/core';
import { IEmployee } from '../../interfaces/IEmployee';
import { Employee } from '../../services/employee';
import { Branch } from '../../services/branch';
import { Subscription, map } from 'rxjs';

@Component({
  selector: 'app-new-request-type-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './new-request-type-modal.html',
  styleUrls: ['./new-request-type-modal.scss', '../../../styles.scss']
})
export class NewRequestTypeModal {
  constructor(private employeeService: Employee, private branchService: Branch) {
    branchService.getBranches(1, 9999).subscribe((res: any) => {
      console.log(res);

      this.branches = res.tenants.map((branch: any) => ({ name: branch.name, id: branch.id }));
    });
  }

  isOpen = signal(false);
  @Output() save = new EventEmitter<IRequestType>();
  signers = signal<IEmployee[]>([]);
  selectedSigners: IEmployee[] = [];
  currentBranch = signal<string>('');
  documentToSign: File[] = [];
  all = signal(false);
  branches: { name: string; id: string }[] = [];

  private branchSub?: Subscription;
  fee: boolean = false;



  open() {
    this.isOpen.set(true);
    this.branchSub = this.branchService.currentBranch$.subscribe(branchName => {
      if (branchName) {
        this.currentBranch.set(branchName);
        this.employeeService.getAllEmployees().subscribe((res: any) => {
          this.signers.set(res.employees);
        });
        // Unsubscribe after loading once
        this.branchSub?.unsubscribe();
      }
    });
  }

  toggleSigner(signer: IEmployee, checked: boolean) {
    if (checked) {
      this.selectedSigners.push(signer);
      this.signers.set(this.signers().filter(s => s.id !== signer.id));
    } else {
      this.selectedSigners = this.selectedSigners.filter(s => s.id !== signer.id);
      this.signers.set([...this.signers(), signer]);
    }
  }
  onBranchChange(branchName: string) {
    this.currentBranch.set(branchName);
  }

  removeDocumentToSign(index: number) {
    this.documentToSign.splice(index, 1);
  }

  handleDocsInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.documentToSign = [...input.files];
    }
    input.value = ''; // reset input field
  }

  close() {
    this.isOpen.set(false);
    this.selectedSigners = [];
  }

  submit(form: NgForm) {
    if (form.valid) {
      console.log(this.fee);
      const formDataToSign = new FormData();
      this.documentToSign.forEach(file => {
        formDataToSign.append('files', file);
      });
      const newRequestType: any = {
        tenantId: this.all() ? "All" : this.currentBranch(),
        name: form.value.name,
        description: form.value.description,
        fee: this.fee,
        employeeIds: this.selectedSigners.map(s => s.id),
        templateDocument: formDataToSign
      };
      this.save.emit(newRequestType);
      this.close();
      form.resetForm();
    }
  }
}
