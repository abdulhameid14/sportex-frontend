import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Auth } from './auth.js';
import { IRole, IPermission } from './../interfaces/IRole';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  apiUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient, private authService: Auth) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); // Ensure the JWT token is available
    if (!token) {
      throw new Error('No token found');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getRoles(currentPage: number, branchName: string): Observable<IRole[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<IRole[]>(`${this.apiUrl}/admin/roles?limit=15&page=${currentPage}&tenantId=${branchName}`, { headers });
  }

  getRoleById(roleId: string): Observable<IRole> {
    const headers = this.getHeaders();
    return this.httpClient.get<IRole>(`${this.apiUrl}/admin/roles/${roleId}`, { headers });
  }

  getAllRoles(branchName: string): Observable<IRole[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<IRole[]>(`${this.apiUrl}/admin/roles?limit=100000&tenantId=${branchName}`, { headers });
  }

  getPermissions(): Observable<IPermission[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<IPermission[]>(`${this.apiUrl}/admin/permissions`, { headers });
  }

  createRole(role: IRole): Observable<IRole> {
    const headers = this.getHeaders();
    return this.httpClient.post<IRole>(`${this.apiUrl}/admin/roles`, role, { headers });
  }

  assignPermissionsToRole(payload: any): Observable<IRole> {
    const headers = this.getHeaders();
    return this.httpClient.post<IRole>(`${this.apiUrl}/admin/roles/permissions`, payload, { headers });
  }

  assignUsersToRole(payload: any): Observable<IRole> {
    const headers = this.getHeaders();
    return this.httpClient.post<IRole>(`${this.apiUrl}/admin/users/roles`, payload, { headers });
  }

  deleteRole(roleId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.delete(`${this.apiUrl}/admin/roles/${roleId}`, { headers });
  }

}
