import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { IUserPerformance } from '../interfaces/IUserPerformance.js';
import { Auth } from './auth.js';

@Injectable({
  providedIn: 'root'
})
export class UserPerformance {
  apiUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient,
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

  getUserPerformances(branchName: string): Observable<IUserPerformance[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<IUserPerformance[]>(`${this.apiUrl}/userperformances?tenantId=${branchName}`, { headers });
  }

  getUserPerformanceById(userPerformanceId: string): Observable<IUserPerformance> {
    const headers = this.getHeaders();
    return this.httpClient.get<IUserPerformance>(`${this.apiUrl}/userperformances/${userPerformanceId}`, { headers });
  }

  createUserPerformance(userPerformance: IUserPerformance): Observable<IUserPerformance> {
    const headers = this.getHeaders();
    return this.httpClient.post<IUserPerformance>(`${this.apiUrl}/userperformances`, userPerformance, { headers });
  }

  updateUserPerformance(userPerformanceId: string, userPerformance: IUserPerformance): Observable<IUserPerformance> {
    const headers = this.getHeaders();
    return this.httpClient.put<IUserPerformance>(`${this.apiUrl}/userperformances/${userPerformanceId}`, userPerformance, { headers });
  }

  deleteUserPerformance(userPerformanceId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.delete(`${this.apiUrl}/userperformances/${userPerformanceId}`, { headers });
  }
}
