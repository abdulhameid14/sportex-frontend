import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { IDepartment } from '../interfaces/IDepartment.js';
import { Auth } from './auth.js';

@Injectable({
  providedIn: 'root'
})
export class Department {
  apiUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient,
    private authService: Auth
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); // Ensure the JWT token is available
    if (!token) {
      throw new Error('No token found');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getDepartments(currentPage: number, branchName: string): Observable<IDepartment[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<IDepartment[]>(`${this.apiUrl}/departments?[limit]=15&page=${currentPage}&[tenantId]=${branchName}`, { headers });
  }

  getAllDepartments(branchName: string): Observable<IDepartment[]> {
    const headers = this.getHeaders();
    if (branchName === "") {
      return this.httpClient.get<IDepartment[]>(`${this.apiUrl}/departments?[limit]=100000`, { headers });
    }
    return this.httpClient.get<IDepartment[]>(`${this.apiUrl}/departments?[tenantId]=${branchName}&[limit]=1000`, { headers });
  }

  getDepartmentsByBranch(branchName: string): Observable<IDepartment[]> {
    const headers = this.getHeaders();
    if (branchName === "") {
      return this.httpClient.get<IDepartment[]>(`${this.apiUrl}/departments?[limit]=1000`, { headers });
    }
    return this.httpClient.get<IDepartment[]>(`${this.apiUrl}/departments?[tenantId]=${branchName}`, { headers });
  }

  getDepartmentById(departmentId: string): Observable<IDepartment> {
    const headers = this.getHeaders();
    return this.httpClient.get<IDepartment>(`${this.apiUrl}/departments/${departmentId}`, { headers });
  }

  createDepartment(newDepartment: IDepartment): Observable<IDepartment> {
    const headers = this.getHeaders();
    return this.httpClient.post<IDepartment>(`${this.apiUrl}/departments`, newDepartment, { headers });
  }

  updateDepartment(departmentId: string, department: any): Observable<IDepartment> {
    const headers = this.getHeaders();
    return this.httpClient.put<IDepartment>(`${this.apiUrl}/departments/${departmentId}`, department, { headers });
  }

  deleteDepartment(departmentId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.delete(`${this.apiUrl}/departments/${departmentId}`, { headers });
  }
}
