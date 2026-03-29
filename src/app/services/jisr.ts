import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root'
})
export class JisrService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient,
              private authService: Auth
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); // Ensure the JWT token is available
    if (!token) {
      throw new Error('No token found');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getAttendanceSummary(page: number = 1, perPage: number = 20): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/jisr/attendance-summary?page=${page}&per_page=${perPage}`, { headers });
  }

  getMyAttendance(page: number = 1, perPage: number = 20): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/jisr/my-attendance?page=${page}&per_page=${perPage}`, { headers });
  }

  getAllAttendance(status: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/jisr/all-attendance?status=${status}`, { headers });
  }

  getLeaveSummary(type: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/jisr/leave-summary?leave_type=${type}`, { headers });
  }

  getPayroll(group: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/jisr/payroll?paygroup_id=${group}`, { headers });
  }
}


