import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { IReport, reportType } from '../interfaces/IReport.js';
import { Auth } from './auth.js';

@Injectable({
  providedIn: 'root'
})
export class Report {
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

  getReports(currentPage: number, branchName: string): Observable<IReport[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<any>(`${this.apiUrl}/reports?[limit]=15&page=${currentPage}&[tenantId]=${branchName}`, { headers }).pipe(
      map(response => {
        const reports = response.reports || []; // access inner array safely
        return reports.filter(
          (report: IReport) => report.data?.reportType === reportType.Support
        );
      })
    );
  }

  getTransactions(currentPage: number, branchName: string): Observable<IReport[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<any>(`${this.apiUrl}/reports?[limit]=15&page=${currentPage}&[tenantId]=${branchName}`, { headers }).pipe(
      map(response => {
        const reports = response.reports || []; // access inner array safely
        return reports.filter(
          (report: IReport) => report.data?.reportType === reportType.Transaction
        );
      })
    );
  }

  getReportById(reportId: string): Observable<IReport> {
    const headers = this.getHeaders();
    return this.httpClient.get<IReport>(`${this.apiUrl}/reports/${reportId}`, { headers });
  }

  createReport(newReport: IReport): Observable<IReport> {
    const headers = this.getHeaders();
    return this.httpClient.post<IReport>(`${this.apiUrl}/reports`, newReport, { headers });
  }

  updateReport(reportId: string, report: any): Observable<IReport> {
    const headers = this.getHeaders();
    return this.httpClient.patch<IReport>(`${this.apiUrl}/reports/${reportId}`, report, { headers });
  }

  deleteReport(reportId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.delete(`${this.apiUrl}/reports/${reportId}`, { headers });
  }
}
