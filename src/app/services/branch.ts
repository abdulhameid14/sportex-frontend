import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { Auth } from './auth.js';
import { IBranch } from '../interfaces/IBranch';
import { User } from './user';
import { IUser } from '../interfaces/IUser';

@Injectable({
  providedIn: 'root'
})
export class Branch {
  apiUrl = environment.apiUrl;
  private readonly currentBranchKey = 'currentBranch';
  private readonly currentBranchModulesKey = 'currentBranchModules';
  private currentBranchSubject = new BehaviorSubject<string>('');
  currentBranch$ = this.currentBranchSubject.asObservable();
  private currentBranchDataSubject = new BehaviorSubject<IBranch | null>(null);
  currentBranchData$ = this.currentBranchDataSubject.asObservable();
  private currentBranchModulesSubject = new BehaviorSubject<string[]>([]);
  currentBranchModules$ = this.currentBranchModulesSubject.asObservable();
  private currentUser = new BehaviorSubject<IUser | null>(null);
  currentUser$ = this.currentUser.asObservable();
  private cachedBranches: IBranch[] = [];

  constructor(private httpClient: HttpClient, private authService: Auth, private userService: User) {
    const savedBranchName = localStorage.getItem(this.currentBranchKey);
    const savedModules = localStorage.getItem(this.currentBranchModulesKey);

    if (savedBranchName) {
      this.currentBranchSubject.next(savedBranchName);
      this.currentBranchModulesSubject.next(savedModules ? this.normalizeModuleKeys(JSON.parse(savedModules)) : this.getDefaultModules());
    }

    this.authService.loginStatus$.subscribe((loggedIn) => {
      if (loggedIn || this.authService.isLoggedIn()) {
        this.initializeBranchCache();
        this.userService.getCurrentUser().subscribe((res: any) => {
          this.currentUser.next(res.user);
          if (res.user?.tenantId && !savedBranchName) {
            this.currentBranchSubject.next(res.user.tenantId);
          }
          if (!savedModules) {
            this.currentBranchModulesSubject.next(this.getDefaultModules());
          }
        });
      }
    });
  }

  private initializeBranchCache(): void {
    this.getAllBranches().subscribe({
      next: () => {
        this.restoreCurrentBranchData();
      },
      error: () => {
        // ignore branch cache failure, keep persisted state
      }
    });
  }

  private restoreCurrentBranchData(): void {
    const currentBranchName = this.currentBranchSubject.value;
    if (!currentBranchName || this.currentBranchDataSubject.value) {
      return;
    }

    const branch = this.findBranchByNameOrId(currentBranchName);
    if (branch) {
      this.currentBranchDataSubject.next(branch);
    }
  }

  private findBranchByNameOrId(branchName: string): IBranch | undefined {
    return this.cachedBranches.find(b => b.name === branchName || b.id === branchName);
  }

  private getDefaultModules(): string[] {
    return [
      'players',
      'financial_reports',
      'requests',
      'roles',
      'request_types',
      'player_scout',
      'players_performance',
      'strategies',
      'chat',
      'announcements',
      'send_notification',
      'notification',
      'meetings',
      'sign',
      'settings',
      'my_archives',
      'all_archives',
      'archived_data',
      'my_profile'
    ];
  }

  private readonly legacyModuleMap: Record<string, string[]> = {
    hr: ['players'],
    recruitment: ['player_scout'],
    finance: ['financial_reports'],
    reports: ['financial_reports'],
    esign: ['sign'],
    announcement: ['announcements'],
    notifications: ['notification', 'send_notification'],
    notification: ['notification'],
    send_notification: ['send_notification'],
    meeting: ['meetings'],
    meetings: ['meetings'],
    request_types: ['request_types'],
    player_scout: ['player_scout'],
    players_performance: ['players_performance'],
    players: ['players'],
    roles: ['roles'],
    strategies: ['strategies'],
    chat: ['chat'],
    announcements: ['announcements'],
    sign: ['sign'],
    settings: ['settings'],
    my_archives: ['my_archives'],
    all_archives: ['all_archives'],
    archived_data: ['archived_data'],
    my_profile: ['my_profile'],
    projects: ['projects'],
    departments: ['departments'],
    external_reports: ['external_reports'],
    branches: ['branches'],
    jisr: ['jisr'],
    dashboard: ['players']
  };

  private normalizeModuleKeys(modules: string[] | null | undefined): string[] {
    if (!modules?.length) {
      return [];
    }

    const normalized = new Set<string>();

    modules.forEach((moduleKey) => {
      if (!moduleKey) {
        return;
      }

      const key = moduleKey.trim().toLowerCase();
      const mappedKeys = this.legacyModuleMap[key] || [key];
      mappedKeys.forEach((mappedKey) => normalized.add(mappedKey));
    });

    return Array.from(normalized);
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); // Ensure the JWT token is available
    if (!token) {
      throw new Error('No token found');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getDashboardData(): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.get<any>(`${this.apiUrl}/users/dashboard-stats`, { headers });
  }

  getBranches(currentPage: number, limit = 15): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.get<any>(`${this.apiUrl}/tenants?[limit]=${limit}&page=${currentPage}`, { headers });
  }

  getAllBranches(): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.get<any>(`${this.apiUrl}/tenants?[limit]=100000`, { headers }).pipe(
      tap((res: any) => {
        if (res?.tenants) {
          this.cachedBranches = res.tenants;
        }
      })
    );
  }

  createBranch(newBranch: IBranch): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.post<any>(`${this.apiUrl}/tenants`, newBranch, { headers });
  }

  updateBranch(branchId: string, branch: any): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.put<any>(`${this.apiUrl}/tenants/${branchId}`, branch, { headers });
  }

  deleteBranch(branchId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.delete(`${this.apiUrl}/tenants/${branchId}`, { headers });
  }

  setCurrentBranch(branch: IBranch) {
    if (branch.name) {
      this.currentBranchSubject.next(branch.name);
      localStorage.setItem(this.currentBranchKey, branch.name);
    }
    this.currentBranchDataSubject.next(branch);
    const modules = branch.enabledModuleKeys && branch.enabledModuleKeys.length ? branch.enabledModuleKeys : branch.modules && branch.modules.length ? branch.modules : this.getDefaultModules();
    const normalizedModules = this.normalizeModuleKeys(modules);
    this.currentBranchModulesSubject.next(normalizedModules);
    localStorage.setItem(this.currentBranchModulesKey, JSON.stringify(normalizedModules));
  }

  setCurrentBranchByName(branchName: string) {
    const branch = this.findBranchByNameOrId(branchName);
    if (branch) {
      this.setCurrentBranch(branch);
      return;
    }

    if (!this.cachedBranches.length) {
      this.initializeBranchCache();
    }

    this.currentBranchSubject.next(branchName);
    const modules = this.getDefaultModules();
    this.currentBranchModulesSubject.next(modules);
    localStorage.setItem(this.currentBranchKey, branchName);
    localStorage.setItem(this.currentBranchModulesKey, JSON.stringify(modules));
  }

  updateCurrentBranch(branchName: string) {
    this.currentBranchSubject.next(branchName);
  }
}
