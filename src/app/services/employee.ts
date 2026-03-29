import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../environments/environment';
import { IEmployee } from '../interfaces/IEmployee';
import { Auth } from './auth.js';

@Injectable({
  providedIn: 'root'
})
export class Employee {
  apiUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient, private authService: Auth) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); // Ensure the JWT token is available
    if (!token) {
      throw new Error('No token found');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getEmployees(currentPage: number, branchName: string, departmentId: string): Observable<IEmployee[]> {
    const headers = this.getHeaders();
    if (departmentId === "ALL") {
      return this.httpClient.get<IEmployee[]>(`${this.apiUrl}/employees?[limit]=15&page=${currentPage}&[tenantId]=${branchName}`, { headers });
    }
    return this.httpClient.get<IEmployee[]>(`${this.apiUrl}/employees?[limit]=15&page=${currentPage}&[tenantId]=${branchName}&[departmentId]=${departmentId}`, { headers });
  }

  getAllEmployees(): Observable<IEmployee[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<IEmployee[]>(`${this.apiUrl}/employees?[limit]=100000`, { headers });
  }

  getEmployeesByBranch(branchName: string, departmentId = null as any): Observable<IEmployee[]> {
    const headers = this.getHeaders();
    if (branchName === "" && !departmentId) {
      return this.httpClient.get<IEmployee[]>(`${this.apiUrl}/employees?[limit]=100000`, { headers });
    } else if (branchName !== "" && !departmentId) {
      return this.httpClient.get<IEmployee[]>(`${this.apiUrl}/employees?[tenantId]=${branchName}&[limit]=100000`, { headers });
    } else if (branchName === "" && departmentId) {
      return this.httpClient.get<IEmployee[]>(`${this.apiUrl}/employees?[limit]=100000&[departmentId]=${departmentId}`, { headers });
    }

    return this.httpClient.get<IEmployee[]>(`${this.apiUrl}/employees?[tenantId]=${branchName}&[limit]=100000&[departmentId]=${departmentId}`, { headers });
  }

  getEmployeeById(employeeId: string): Observable<IEmployee> {
    const headers = this.getHeaders();
    return this.httpClient.get<IEmployee>(`${this.apiUrl}/employees/${employeeId}`, { headers });
  }

  createEmployee(data: any): Observable<IEmployee> {
    const headers = this.getHeaders();
    return this.httpClient.post<any>(`${this.apiUrl}/employees`, data, { headers });
  }

  updateEmployee(employeeId: string, employee: any): Observable<IEmployee> {
    const headers = this.getHeaders();
    return this.httpClient.patch<IEmployee>(`${this.apiUrl}/employees/${employeeId}`, employee, { headers });
  }

  updateMyData(employee: any): Observable<IEmployee> {
    const headers = this.getHeaders();
    return this.httpClient.patch<IEmployee>(`${this.apiUrl}/employees/me`, employee, { headers });
  }

  deleteEmployee(employeeId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.delete(`${this.apiUrl}/employees/${employeeId}`, { headers });
  }
}
