import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { IExternalReport } from '../interfaces/IExternalReport';
import { Auth } from './auth.js';

@Injectable({
  providedIn: 'root'
})
export class ExternalReport {
  apiUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient, private authService: Auth) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) throw new Error('No token found');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  createExternalReport(data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.post<any>(`${this.apiUrl}/external-reports`, data, { headers });
  }

  getExternalReports(): Observable<IExternalReport[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<IExternalReport[]>(`${this.apiUrl}/external-reports`, { headers });
  }

  getExternalReportById(id: string): Observable<IExternalReport> {
    const headers = this.getHeaders();
    return this.httpClient.get<IExternalReport>(`${this.apiUrl}/external-reports/${id}`, { headers });
  }

  updateExternalReport(id: string, data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.put<any>(`${this.apiUrl}/external-reports/${id}`, data, { headers });
  }

  deleteExternalReport(id: string): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.delete(`${this.apiUrl}/external-reports/${id}`, { headers });
  }

  signExternalReport(id: string): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.post(`${this.apiUrl}/external-reports/sign/${id}`, {}, { headers });
  }
}
