import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { PermissionService } from './permissions';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private loginApi = `${environment.authApiUrl}/login`;
  // Emits the current login state to subscribers
  private loginStatusSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  loginStatus$ = this.loginStatusSubject.asObservable();


  constructor(
    private http: HttpClient,
    private permService: PermissionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }


  login(email: string, password: string): Observable<any> {
    return this.http.post(this.loginApi, { email, password }).pipe(
      tap((response: any) => {
        const token = response.accessToken || response.token;
        if (token) {
          this.setCookie('jwtToken', token);
          this.setCookie('email', response.user?.email);
          this.setCookie('userId', response.user?.id);
          this.setCookie('employeeId', response.user?.employee.id);
          this.loginStatusSubject.next(true); // Notify subscribers about login
          localStorage.setItem('userData', JSON.stringify(response.user));
          console.log('User data stored in localStorage:', response.user);
          const permissions = response.user?.role?.permissions ?? [];
          this.permService.setPermissions(permissions);
        }
      })
    );
  }

  logout(): void {
    this.deleteCookie('jwtToken');
    this.deleteCookie('email');
    this.deleteCookie('userId');
    this.deleteCookie('employeeId');
    localStorage.removeItem('lang');
    console.log('User logged out, cookies cleared.');
    this.loginStatusSubject.next(false); // Notify subscribers about logout
    location.reload();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return this.getCookie('jwtToken');
  }

  getEmail(): string | null {
    return this.getCookie('email');
  }

  getUserIdFromCookie(): string | null {
    return this.getCookie('userId');
  }

  getEmployeeIdFromCookie(): string | null {
    return this.getCookie('employeeId');
  }

  private setCookie(name: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      document.cookie = `${name}=${encodeURIComponent(value)}; path=/`;
    }
  }

  private getCookie(name: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='))
        ?.split('=')[1] || null;
    }
    return null;
  }

  private deleteCookie(name: string): void {
    if (isPlatformBrowser(this.platformId)) {
      document.cookie = `${name}=; Max-Age=0; path=/`;
    }
  }
}
