import { Component, Input, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomTables } from '../../services/custom-tables';
import { Employee } from '../../services/employee';
import { Auth } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-custom-table',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './custom-table.html',
  styleUrls: ['./custom-table.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomTableComponent implements OnInit {
  tableId: string = '';
  tableMeta: any = {};
  modelKeys: string[] = [];
  rows: any[] = [];
  pendingRows: any[] = [];

  showAddRow = false;
  newRow: any = {};
  fileUploadProgress: { [key: string]: boolean } = {};
  uploadedFileUrls: { [key: string]: string } = {};

  allEmployees: any[] = [];
  allParticipants: any[] = [];
  currentEmployeeId: string = '';

  activeTab: 'all' | 'pending' = 'all';
  loading = true;
  submitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customTablesService: CustomTables,
    private employeeService: Employee,
    private authService: Auth,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentEmployeeId = this.authService.getEmployeeIdFromCookie() || '';

    this.route.paramMap.subscribe(params => {
      this.tableId = params.get('tableId') || '';
      if (this.tableId) {
        this.loadTableData();
      }
    });
  }

  loadTableData() {
    this.loading = true;
    this.customTablesService.getCustomTableById(this.tableId).subscribe({
      next: (meta) => {
        this.tableMeta = meta;
        // Use API `fields` when present (newer backend), fall back to `model` for older shape
        const metaAny = meta as any;
        this.modelKeys = Array.isArray(metaAny.fields) && metaAny.fields.length > 0
          ? metaAny.fields
          : (Array.isArray(meta.model) ? meta.model : []);
        this.cdr.markForCheck();
        this.loadRecords();
        // Load employees and participants based on table configuration
        if (meta.onlyShowToUsers || meta.requireApproval) {
          this.loadEmployees();
        }
      },
      error: (err) => {
        this.toastService.show('Failed to load table metadata', 'error');
        console.error(err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadRecords() {
    this.customTablesService.getRecords(this.tableId).subscribe({
      next: (records) => {
        this.rows = records;
        this.filterPendingRows();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastService.show('Failed to load records', 'error');
        console.error(err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadEmployees() {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        // Handle both direct array and wrapped responses
        const empAny = employees as any;
        const empList = Array.isArray(empAny) ? empAny : (empAny?.data || []);
        this.allEmployees = Array.isArray(empList) ? empList : [];
        this.allParticipants = this.allEmployees;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastService.show('Failed to load employees', 'error');
        this.allEmployees = [];
        this.allParticipants = [];
        console.error(err);
      }
    });
  }

  filterPendingRows() {
    if (!this.tableMeta.requireApproval) {
      this.pendingRows = [];
      return;
    }
    this.pendingRows = this.rows.filter(row => {
      const hasVoted = row.participants?.some((p: any) => p.id === this.currentEmployeeId);
      return !hasVoted;
    });
  }

  addRow() {
    this.showAddRow = true;
    this.newRow = {};
    this.uploadedFileUrls = {};
    this.cdr.markForCheck();
  }

  cancelAddRow() {
    this.showAddRow = false;
    this.newRow = {};
    this.uploadedFileUrls = {};
    this.cdr.markForCheck();
  }

  onFileSelect(event: any, key: string) {
    const file = event.target.files[0];
    if (!file) return;

    this.fileUploadProgress[key] = true;
    this.customTablesService.uploadFile(file).subscribe({
      next: (res) => {
        const uploadedUrl = res.url || res.data?.url || res.data;
        this.uploadedFileUrls[key] = uploadedUrl;
        this.newRow[key] = uploadedUrl;
        this.fileUploadProgress[key] = false;
        this.toastService.show('File uploaded successfully', 'success');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastService.show('File upload failed', 'error');
        console.error(err);
        this.fileUploadProgress[key] = false;
        this.cdr.markForCheck();
      }
    });
  }

  saveRow() {
    if (this.submitting) return;

    // Validate that at least one data field is filled
    const dataKeys = this.modelKeys.filter(key => !this.isFileField(key));
    const hasData = dataKeys.some(key => this.newRow[key]);

    if (!hasData && dataKeys.length > 0) {
      this.toastService.show('Please fill at least one field', 'error');
      return;
    }

    this.submitting = true;

    // Build payload based on table configuration
    const payload: any = {
      tenant: this.tableMeta.tenantId,
      data: this.newRow
    };

    // Add employees if configured
    if (this.tableMeta.onlyShowToUsers) {
      payload.employees = this.newRow.employees || [];
    }

    // Add participants if configured
    if (this.tableMeta.requireApproval) {
      payload.participants = (this.newRow.participants || []).map((emp: any) => ({
        id: emp.id || emp,
        vote: null,
        comment: null
      }));
    }

    this.customTablesService.createRecord(this.tableId, payload).subscribe({
      next: (res) => {
        this.toastService.show('Record created successfully', 'success');
        this.showAddRow = false;
        this.newRow = {};
        this.uploadedFileUrls = {};
        this.loadRecords();
        this.submitting = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastService.show('Failed to create record', 'error');
        console.error(err);
        this.submitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  canDelete(row: any) {
    return row.createdBy === this.currentEmployeeId;
  }

  deleteRow(row: any) {
    if (!this.canDelete(row)) {
      this.toastService.show('You can only delete records you created', 'error');
      return;
    }

    if (!confirm('Are you sure you want to delete this record?')) return;

    this.customTablesService.deleteRecord(this.tableId, row.id).subscribe({
      next: () => {
        this.toastService.show('Record deleted successfully', 'success');
        this.loadRecords();
      },
      error: (err) => {
        this.toastService.show('Failed to delete record', 'error');
        console.error(err);
      }
    });
  }

  submitVote(row: any, vote: string, comment: string) {
    this.customTablesService.voteOnRecord(this.tableId, row.id, vote, comment).subscribe({
      next: () => {
        this.toastService.show('Vote submitted', 'success');
        this.loadRecords();
      },
      error: (err) => {
        this.toastService.show('Failed to submit vote', 'error');
        console.error(err);
      }
    });
  }

  isFileField(key: string): boolean {
    return key.toLowerCase().includes('file') || key.toLowerCase().includes('image');
  }

  getEmployeeName(id: string): string {
    const empAny = this.allEmployees as any;
    const list = Array.isArray(empAny) ? empAny : (empAny?.data || []);
    const found = Array.isArray(list) ? list.find((e: any) => e.id === id) : null;
    return found?.name || id;
  }

  getEmployeeNames(employees: any[]): string {
    if (!employees) return '-';
    const empAny = employees as any;
    const list = Array.isArray(empAny) ? empAny : (empAny?.data || []);
    if (!Array.isArray(list) || list.length === 0) return '-';
    return list.map((e: any) => e.name || e).join(', ') || '-';
  }

  setTab(tab: 'all' | 'pending') {
    this.activeTab = tab;
    this.cdr.markForCheck();
  }

  trackById(index: number, item: any): string {
    return item.id;
  }
}
