import { Component, effect, OnInit, signal, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Branch } from '../../services/branch';
import { Employee } from '../../services/employee';
import { Department } from '../../services/department';
import { WebsocketService } from '../../services/websocket-service';

import { IBranch } from '../../interfaces/IBranch';
import { IDepartment } from '../../interfaces/IDepartment';
import { IEmployee } from '../../interfaces/IEmployee';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notification-page',
  standalone: true,
  imports: [TranslateModule, CommonModule, FormsModule,],
  templateUrl: './notification-page.html',
  styleUrls: ['./notification-page.scss']
})
export class NotificationPage implements OnInit {
  isLoading = signal(false);

  // UI
  isOpen = signal(true); // always visible — modal removed

  // Filters
  currentBranch = signal<string>('');
  currentDepartment = signal<string>('');

  // Data lists
  branchList = signal<IBranch[]>([]);
  departments = signal<IDepartment[]>([]);
  employees = signal<IEmployee[]>([]);

  // Selected employees
  selectedSigners: IEmployee[] = [];

  // Notifications
  constructor(
    private branchService: Branch,
    private empService: Employee,
    private departmentService: Department,
    private websocket: WebsocketService
  ) {

    // Auto reload when selecting branch / department
    effect(() => {
      const branch = this.currentBranch();
      const department = this.currentDepartment();

      if (!branch) {
        this.loadAll();
        return;
      }

      this.departmentService.getDepartmentsByBranch(branch)
        .subscribe((res: any) => {
          this.departments.set(res.departments);
        });

      this.empService.getEmployeesByBranch(branch, department || '')
        .subscribe((res: any) => {
          this.employees.set(res.employees);
        });
    });
  }

  ngOnInit() {

    this.branchService.getAllBranches().subscribe((res: any) => {
      this.branchList.set(res.tenants);
    });

    this.loadAll();
  }

  // Load initial data
  loadAll() {
    this.departmentService.getAllDepartments('')
      .subscribe((res: any) => this.departments.set(res.departments));

    this.empService.getAllEmployees()
      .subscribe((res: any) => this.employees.set(res.employees));
  }

  toggleBranch(branchId: string) {
    this.currentBranch.set(branchId);
    this.currentDepartment.set('');
  }

  toggleDepartment(deptId: string) {
    this.currentDepartment.set(deptId);
  }

  toggleSigner(signer: IEmployee, checked: boolean) {
    if (checked) this.selectedSigners.push(signer);
    else this.selectedSigners = this.selectedSigners.filter(s => s.id !== signer.id);
  }

  removeSigner(signer: IEmployee) {
    this.selectedSigners = this.selectedSigners.filter(s => s.id !== signer.id);
  }

  submit(form: any) {
    if (form.valid) {
      this.isLoading.set(true);
      this.websocket.sendNotification(
        form.value.title,
        form.value.content,
        form.value,
        this.selectedSigners
      );
      this.selectedSigners = [];
      form.reset();
      this.isLoading.set(false);
    }
  }
}

