import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Branch } from '../../services/branch.js';
import { IRequestType } from '../../interfaces/IRequest.js';
import { Employee } from './../../services/employee';
import { IEmployee } from '../../interfaces/IEmployee.js';
import { HasPermissionDirective } from '../../directives/has-permission.js';
import { IBranch } from '../../interfaces/IBranch.js';

@Component({
  selector: 'app-view-request-type-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, HasPermissionDirective],
  templateUrl: './view-request-type-modal.html',
  styleUrls: ['./view-request-type-modal.scss', '../../../styles.scss']
})
export class ViewRequestTypeModal {
  requestType = signal<IRequestType | null>(null);
  @Output() update = new EventEmitter<IRequestType>();
  @Output() closed = new EventEmitter<void>();
  isOpen = signal(false);
  editMode = signal(false);
  currentBranch = signal<string | null>(null);
  allEmployees = signal<IEmployee[]>([]);
  branches = signal<IBranch[]>([]);
  selectedSigners: IEmployee[] = [];
  newTemplateDocument: File[] = [];
  currentTemplateDocument = signal<string[]>([]);
  updatedName: string = '';
  updatedDescription: string = '';
  updatedBranch: string = '';

  constructor(private branchService: Branch, private employeeService: Employee) {}

  open(requestType: IRequestType) {
    console.log('Opening Request Type Modal for:', requestType);
    this.requestType.set({ ...requestType });
    this.updatedName = requestType.name;
    this.updatedDescription = requestType.description!;
    this.updatedBranch = requestType.tenantId!;
    this.currentTemplateDocument.set(this.documents);
    this.isOpen.set(true);
    this.editMode.set(false);
    this.branchService.currentBranch$.subscribe(branchName => {
      if (branchName) {
        this.currentBranch.set(branchName);
        this.employeeService.getAllEmployees().subscribe((res: any) => {
          this.allEmployees.set(res.employees);
        });
        this.branchService.getAllBranches().subscribe((res: any) => {
          this.branches.set(res.tenants);
        });
      }
    });
  }

  get documents(): string[] {
    return this.requestType()!.templateDocument ? this.requestType()!.templateDocument!.split(/,(?=\/uploads\/center\/)/) : [];
  }

  removeNewDocument(index: number) {
    this.newTemplateDocument.splice(index, 1);
  }

  removeCurrentDocument(index: number) {
    this.currentTemplateDocument.set(this.currentTemplateDocument().filter((_, i) => i !== index));
  }

  handleDocumentInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.newTemplateDocument = [...input.files];
    }
    input.value = ''; // reset input field
  }

  close() {
    this.isOpen.set(false);
    this.closed.emit();
    this.selectedSigners = []
    this.currentTemplateDocument.set(this.documents);
    this.newTemplateDocument = [];
    this.updatedName = this.requestType!.name;
    this.updatedDescription = this.requestType()!.description!;
    this.updatedBranch = this.requestType()!.tenantId!;
  }

  enableEdit() {
    this.editMode.set(true);
  }

  cancelChanges() {
    if (this.requestType) {
      this.currentTemplateDocument.set(this.documents);
      this.newTemplateDocument = [];
      this.selectedSigners = []
      this.updatedName = this.requestType!.name;
      this.updatedDescription = this.requestType()!.description!;
      this.updatedBranch = this.requestType()!.tenantId!;
    }
    this.editMode.set(false);
  }

  onSignerToggle(event: Event, signer: IEmployee) {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      if (!this.selectedSigners.includes(signer)) {
        this.selectedSigners.push(signer);
      }
    } else {
      this.selectedSigners = this.selectedSigners.filter(s => s.id !== signer.id);
    }
  }

  saveChanges() {
    if (this.requestType) {
      const formDataDocument = new FormData();
      this.newTemplateDocument.forEach(file => {
        formDataDocument.append('files', file);
      });
      const updatedRequestType: any = {
        id: this.requestType()!.id,
        tenantId: this.updatedBranch,
        name: this.updatedName,
        description: this.updatedDescription,
        currentTemplateDocument: this.currentTemplateDocument().join(','),
        newTemplateDocument: formDataDocument,
        signerIds: this.selectedSigners.map(s => s.id)
      };
      console.log('Updated Request Type from modal:', updatedRequestType);
      this.update.emit(updatedRequestType);
      this.close();
    }
  }
}
