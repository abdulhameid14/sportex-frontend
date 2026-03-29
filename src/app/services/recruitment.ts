import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { IRecruitment } from '../interfaces/IRecruitment.js';
import { Auth } from './auth.js';

@Injectable({
  providedIn: 'root'
})
export class Recruitments {
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

  getRecruitments(currentPage: number, branchName: string): Observable<IRecruitment[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<IRecruitment[]>(`${this.apiUrl}/recruitments?[limit]=15&page=${currentPage}&[tenantId]=${branchName}`, { headers });
  }

  getRecruitmentById(recruitmentId: string): Observable<IRecruitment> {
    const headers = this.getHeaders();
    return this.httpClient.get<IRecruitment>(`${this.apiUrl}/recruitments/${recruitmentId}`, { headers });
  }

  createRecruitment(newRecruitment: IRecruitment): Observable<IRecruitment> {
    const headers = this.getHeaders();
    return this.httpClient.post<IRecruitment>(`${this.apiUrl}/recruitments`, newRecruitment, { headers });
  }

  updateRecruitment(recruitmentId: string, recruitment: any): Observable<IRecruitment> {
    const headers = this.getHeaders();
    return this.httpClient.put<IRecruitment>(`${this.apiUrl}/recruitments/${recruitmentId}`, recruitment, { headers });
  }

  deleteRecruitment(recruitmentId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.delete(`${this.apiUrl}/recruitments/${recruitmentId}`, { headers });
  }
}
