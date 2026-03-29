import { ToastService } from './../../services/toast';
import { Component, signal, OnInit, ViewChild, ElementRef, NgZone, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule, } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from '../../services/translation';
import { Department } from '../../services/department';
import { IDepartment } from '../../interfaces/IDepartment';
import { User } from '../../services/user';
import { NewAccount } from "../new-account/new-account";
import { Branch } from '../../services/branch';
import { Employee } from '../../services/employee';
import { HasPermissionDirective } from '../../directives/has-permission';
import SignaturePad from 'signature_pad';
import { IBranch } from '../../interfaces/IBranch';
import { IRole } from '../../interfaces/IRole';
import { RoleService } from '../../services/role-service';
import { Roles } from '../roles/roles';
import { IUser } from '../../interfaces/IUser';
import { ChangePasswordModal } from '../change-password-modal/change-password-modal';
import { HasAnyPermissionDirective } from '../../directives/hasAnyPermission';
import { Toast } from '../toast/toast';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, Toast, HasAnyPermissionDirective, ChangePasswordModal, Roles, TranslateModule, NewAccount, CommonModule, HasPermissionDirective],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss', '../../../styles.scss']
})
export class Settings implements OnInit {
  @ViewChild(ChangePasswordModal) passwordModal!: ChangePasswordModal;
  @ViewChild('signatureCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  signaturePad!: SignaturePad;
  isSignatureOpen = false;
  departmentList = signal<IDepartment[]>([]);
  branchList = signal<IBranch[]>([]);
  roleList = signal<IRole[]>([]);
  user = signal<IUser | null>(null);
  isActiveTab = signal<string>('user_profile');
  isLoading = signal(false);
  activeTab = signal<'user' | 'account' | 'roles'>('user');
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;
  savedSignature = signal<string | null>(null);
  passwordVisible: boolean = false;
  userPhoto: File | null = null;
  selectedImage = signal<string | ArrayBuffer | null>(null);
  isDrawing = false;

  constructor(public translation: TranslationService,
    private depService: Department,
    private userService: User,
    private empService: Employee,
    private branchService: Branch,
    private roleService: RoleService,
    private toast: ToastService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab) {
        this.setActiveTab(tab);
      }
    });

    this.userService.getCurrentUser().subscribe((res: any) => {
      this.user.set(res.user);
      if (res.user.employee.photo != '' && res.user.employee.photo != null){
        this.selectedImage.set('https://api.kayanatdashboard.com/api' + res.user.employee.photo);
      }
      this.depService.getAllDepartments(res.user.tenantId).subscribe((res: any) => {
      this.departmentList.set(res.departments);
      console.log('Departments loaded: ', res.departments);
      });
      this.branchService.getAllBranches().subscribe((res: any) => {
        this.branchList.set(res.tenants);
        console.log('Branches loaded: ', res.tenants);
      });
      this.roleService.getAllRoles(res.user.tenantId).subscribe((res: any) => {
        this.roleList.set(res.roles);
        console.log('Roles loaded: ', res.roles);
      });
      // Load saved signature
      if (res.user.signature) {
        this.savedSignature.set(res.user.signature);
      }
    });
  }

  openSignaturePad() {
    this.isSignatureOpen = true;

    setTimeout(() => {
      const canvas = this.canvasRef.nativeElement;
      const ratio = window.devicePixelRatio || 1;

      // 1️⃣ Get displayed size from CSS
      const displayWidth = canvas.offsetWidth;
      const displayHeight = canvas.offsetHeight;

      // 2️⃣ Set REAL drawing size (high DPI)
      canvas.width = displayWidth * ratio;
      canvas.height = displayHeight * ratio;

      // 3️⃣ Scale context
      const ctx = canvas.getContext('2d');
      ctx!.scale(ratio, ratio);

      // 4️⃣ Create signature pad
      this.signaturePad = new SignaturePad(canvas, {
        backgroundColor: '#ffffff',
        penColor: 'black',
        minWidth: 1,
        maxWidth: 2,
        throttle: 0,
        minDistance: 0
      });
    }, 0);
  }

  closeOnOverlay(event: MouseEvent) {
    this.isSignatureOpen = false;
  }

  closePad() {
    this.isSignatureOpen = false;
    if (this.signaturePad) this.signaturePad.off();
  }

  clear() {
    this.signaturePad.clear();
  }

  save() {
    if (this.signaturePad && !this.signaturePad.isEmpty()) {
      // الحصول على dataURL من الإمضاء
      const dataURL = this.signaturePad.toDataURL();
      // استخراج جزء Base64 فقط
      const base64 = dataURL.split(',')[1];
      console.log('Signature Base64:', base64);
      // تخزين الـ Base64 locally
      this.savedSignature.set(base64);
      // إغلاق نافذة الإمضاء
      this.isSignatureOpen = false;
      // إرسال الإمضاء للسيرفر
      this.userService.updateUser(this.user()!.id, { signature: base64 }).subscribe(res => {
        this.toast.show('Signature saved successfully', 'success');
        console.log('Signature saved successfully', res);
        this.isLoading.set(false);
      });
    } else {
      console.log('Signature pad is empty!');
    }
  }

  delete() {
    this.savedSignature.set(null);
    // Remove signature from user
    this.userService.updateUser(this.user()!.id, { signature: "" }).subscribe(res => {
      this.toast.show('Signature deleted successfully', 'success');
      console.log('Signature deleted successfully', res);
      this.isLoading.set(false);
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.userPhoto = file; // store for upload later
      const reader = new FileReader();
      // Update the signal when reading completes
      reader.onload = () => {
        this.selectedImage.set(reader.result);
      };
      reader.readAsDataURL(file); // convert image to base64 for instant preview
    }
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  setActiveTab(tabName: string) {
    this.isActiveTab.set(tabName);
  }

  async submitPersonalInfo(form: NgForm) {
    if (!form.valid) return;
    this.isLoading.set(true);
    const user = this.user();
    const emp = user!.employee;
    const userUpdate: any = {};
    const employeeUpdate: any = {};
    // 1) HANDLE PHOTO FIRST BEFORE DIFF CHECK
    if (this.userPhoto) {
      try {
        const formData = new FormData();
        formData.append('files', this.userPhoto, this.userPhoto.name);
        const uploadRes = await this.userService.uploadFiles(formData).toPromise();
        const photo = uploadRes.links[0];
        employeeUpdate.photo = photo;
        console.log("Photo uploaded and added to update:", photo);
      } catch (err) {
        console.error("Photo upload failed:", err);
        this.isLoading.set(false);
        return;
      }
    }

    // 2) NOW DETECT CHANGES
    if (form.value.email !== user!.email) userUpdate.email = form.value.email;
    if (form.value.role?.id !== user!.role?.id) userUpdate.roleId = form.value.role.id;
    if (form.value.branch !== user!.tenantId) {
      userUpdate.tenantId = form.value.branch;
      employeeUpdate.tenantId = form.value.branch;
    }
    if (form.value.password) { userUpdate.password = form.value.password; };
    if (form.value.nationalId !== user!.nationalId) userUpdate.nationalId = form.value.nationalId;
    if (form.value.username !== emp?.name) employeeUpdate.name = form.value.username;
    if (form.value.phone !== emp?.phone) employeeUpdate.phone = form.value.phone;
    if (form.value.position !== emp?.position) employeeUpdate.position = form.value.position;
    if (form.value.salary !== emp?.salary) employeeUpdate.salary = form.value.salary;
    if (form.value.vacations !== emp?.vacations) employeeUpdate.vacations = form.value.vacations;
    if (form.value.department?.id !== emp?.department?.id) {
      employeeUpdate.departmentId = form.value.department.id;
    }

    // 3) CHECK CHANGES AFTER PHOTO UPLOAD
    if (Object.keys(userUpdate).length === 0 && Object.keys(employeeUpdate).length === 0) {
      console.log("No changes detected");
      this.isLoading.set(false);
      return;
    }

    // 4) RUN API CALLS
    const calls = [];

    if (Object.keys(employeeUpdate).length > 0)
      calls.push(this.empService.updateMyData(employeeUpdate).toPromise());

    if (Object.keys(userUpdate).length > 0 && form.value.password) {
      console.log("Password change requested, opening modal");
      this.passwordModal.open();
      this.passwordModal.confirm.subscribe(res => {
        if (res) {
          calls.push(this.userService.updateMyData(userUpdate).toPromise());
        }
      });
    }
    else if (Object.keys(userUpdate).length > 0 && !form.value.password) {
      console.log("No password change requested, updating user data directly");
      calls.push(this.userService.updateMyData(userUpdate).toPromise());
    }

    Promise.all(calls)
      .then(() => console.log("Updated successfully"))
      .catch(err => console.error("Update error:", err))
      .finally(() => {
        this.isLoading.set(false);
        this.toast.show('Personal information updated successfully', 'success');
      });
  }

}
