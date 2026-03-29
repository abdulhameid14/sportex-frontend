import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { TranslationService } from '../../services/translation';
import { WebsocketService } from '../../services/websocket-service';

@Component({
  selector: 'login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TranslateModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss', '../../../styles.scss']
})
export class Login {
  loginForm: FormGroup;
  errorMessage = signal('');
  passwordVisible: boolean = false;
  isInvalid = signal(true);
  isLoading = signal(false);

  constructor(
    private ws: WebsocketService,
    private fb: FormBuilder,
    private auth: Auth,
    private router: Router,
    private translation: TranslationService
  ) {
    if (auth.isLoggedIn()) {
      this.router.navigate(['/work-space']);
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,

      ]]
    });

    // keep signal in sync with form status
    this.loginForm.statusChanges.subscribe(() => {
      this.isInvalid.set(this.loginForm.invalid);
    });
  }

  onSubmit() {
    this.isLoading.set(true);
    const { email, password } = this.loginForm.value;
    this.auth.login(email, password).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.errorMessage.set('');
        this.passwordVisible = false;
        this.router.navigate(['/work-space']);
        this.ws.init();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.passwordVisible = false;
        if (err.status === 401 || err.status === 400) {
          if (this.translation.translate.currentLang === 'ar') {
            this.errorMessage.set('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
          }
          else {
            this.errorMessage.set('Invalid Email or Password.');
          }
        } else {
          if (this.translation.translate.currentLang === 'ar') {
            this.errorMessage.set('حدث خطأ ما. يرجى المحاولة لاحقًا.');
          }
          else {
            this.errorMessage.set('Something went wrong. Please try later.');
          }
        }
      }
    });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}
