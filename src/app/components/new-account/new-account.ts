import { Employee } from '../../services/employee';
import { Department } from '../../services/department';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IDepartment } from '../../interfaces/IDepartment';
import { CommonModule } from '@angular/common';
import { RoleService } from '../../services/role-service';
import { IRole } from '../../interfaces/IRole';
import { TranslateModule } from '@ngx-translate/core';
import { Branch } from '../../services/branch';
import { User } from '../../services/user';
import { catchError, finalize, map, of, switchMap } from 'rxjs';
import { Toast } from '../toast/toast';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'settings-new-account',
  standalone: true,
  imports: [ReactiveFormsModule, Toast, CommonModule, TranslateModule],
  templateUrl: './new-account.html',
  styleUrls: ['./new-account.scss', '../../../styles.scss']
})
export class NewAccount implements OnInit {
  Departments = signal<IDepartment[]>([]);
  Role = signal<IRole[]>([]);
  addEmployeeForm!: FormGroup;
  passwordVisible: boolean = false;
  currentBranch = signal<string>('');
  userPhoto: File | null = null;
  selectedImage = signal<string | ArrayBuffer | null>(null);
  isLoading = signal(false);

  constructor(private fb: FormBuilder,
    private department: Department,
    private branchServ: Branch,
    private roleService: RoleService,
    private employee: Employee,
    private userService: User,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.branchServ.currentBranch$.subscribe({
      next: (branch) => {
        this.currentBranch.set(branch);
        this.department.getAllDepartments(branch).subscribe({
          next: (res: any) => {
            console.log('Departments fetched:', res.departments);
            this.Departments.set(res.departments);
          }
        });
        this.roleService.getAllRoles(branch).subscribe({
          next: (res: any) => {
            console.log('Roles fetched:', res.roles);
            this.Role.set(res.roles);
          }
        });
      }
    });

    this.addEmployeeForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      name: ['', Validators.required],
      position: ['', Validators.required],
      salary: [null, [Validators.required, Validators.min(0)]],
      vacations: [null, [Validators.required, Validators.min(0)]],
      departmentId: ['', Validators.required],
      phone: ['', Validators.required],
      nationalId: ['', Validators.required],
      roleId: ['', Validators.required],
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.userPhoto = file; // store for upload later
      // Optional: limit file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB.');
        return;
      }
      const reader = new FileReader();
      // Update the signal when reading completes
      reader.onload = () => {
        this.selectedImage.set(reader.result);
      };

      reader.readAsDataURL(file); // convert image to base64 for instant preview
    }
  }

  onSubmit(): void {
    if (!this.addEmployeeForm.valid) {
      this.addEmployeeForm.markAllAsTouched();
      console.log("Invalid Form");
      return;
    }

    this.isLoading.set(true);

    const userPayload = {
      email: this.addEmployeeForm.value.email,
      password: this.addEmployeeForm.value.password,
      tenantId: this.currentBranch(),
      nationalId: this.addEmployeeForm.value.nationalId
    };

    this.userService.createUser(userPayload).pipe(

      switchMap((userRes: any) => {
        const newUserId = userRes.user.id;

        const rolePayload = {
          roleId: this.addEmployeeForm.value.roleId,
          userId: newUserId
        };

        return this.roleService.assignUsersToRole(rolePayload).pipe(
          map(() => newUserId),
          catchError(err => {
            // If role assignment fails → delete user
            this.userService.deleteUser(newUserId).subscribe();
            throw err;
          })
        );
      }),

      switchMap((newUserId) => {
        // If no photo uploaded → skip upload
        if (!this.userPhoto) return of({ photo: "", newUserId });

        const formData = new FormData();
        formData.append("files", this.userPhoto, this.userPhoto.name);

        return this.userService.uploadFiles(formData).pipe(
          map((uploadRes: any) => ({
            photo: uploadRes.links[0],
            newUserId
          }))
        );
      }),
      switchMap(({ photo, newUserId }) => {
        const employeePayload = {
          tenantId: this.currentBranch(),
          name: this.addEmployeeForm.value.name,
          position: this.addEmployeeForm.value.position,
          salary: this.addEmployeeForm.value.salary,
          vacations: this.addEmployeeForm.value.vacations,
          departmentId: this.addEmployeeForm.value.departmentId,
          userId: newUserId,
          active: true,
          photo,
          phone: this.addEmployeeForm.value.phone
        };

        return this.employee.createEmployee(employeePayload).pipe(
          catchError(err => {
            // Employee creation failed → delete user
            this.userService.deleteUser(newUserId).subscribe();
            throw err;
          })
        );
      }),

      finalize(() => {
        this.isLoading.set(false);
        this.toast.show('Employee created successfully', 'success');
      })

    ).subscribe({
      next: () => {
        this.selectedImage.set(null);
        this.addEmployeeForm.reset();
        console.log("Employee created successfully");
      },
      error: (err) => {
        console.error("Error:", err);
      }
    });
  }


  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}
