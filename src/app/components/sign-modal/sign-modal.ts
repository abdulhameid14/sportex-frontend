import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { IRequest } from '../../interfaces/IRequest';
import { TranslateModule } from '@ngx-translate/core';
import { IUser } from '../../interfaces/IUser';
import { User } from '../../services/user';
import { Toast } from '../toast/toast';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-sign-modal',
  standalone: true,
  imports: [CommonModule, Toast, FormsModule, TranslateModule],
  templateUrl: './sign-modal.html',
  styleUrls: ['./sign-modal.scss', '../../../styles.scss']
})
export class SignModal {
  isOpen = signal(false);
  currentBranch = signal<string>('');
  currentUser = signal<IUser | null>(null);
  currentRequest = signal<IRequest | null>(null);

  constructor(private userService: User, private toast: ToastService) {}

  open(request: IRequest) {
    this.isOpen.set(true);
    this.currentRequest.set(request);
  }

  close() {
    this.isOpen.set(false);
  }

  submit(form: NgForm) {
    if (form.valid) {
      const signPayload = {
        requestId: this.currentRequest()!.id,
        Comment: form.value.comment,
        action: form.value.action
      };
      this.userService.signDocs(signPayload).subscribe((res) => {
        this.toast.show('Document signed successfully', 'success');
        console.log('Document signed successfully', res);
      });
      this.close();
      form.resetForm();
    }
  }
}
