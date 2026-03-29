import { Department } from './department';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { IStrategy } from '../interfaces/IStrategy.js';
import { Auth } from './auth.js';

@Injectable({
  providedIn: 'root'
})
export class strategyService {
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

  getStrategies(currentPage: number, branchName: string, departmentId: string): Observable<IStrategy[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<IStrategy[]>(`${this.apiUrl}/strategies?[limit]=15&page=${currentPage}&[tenantId]=${branchName}&[departmentId]=${departmentId}`, { headers });
  }

  getStrategyById(strategyId: string): Observable<IStrategy> {
    const headers = this.getHeaders();
    return this.httpClient.get<IStrategy>(`${this.apiUrl}/strategies/${strategyId}`, { headers });
  }

  createStrategy(newStrategy: IStrategy): Observable<IStrategy> {
    const headers = this.getHeaders();
    return this.httpClient.post<IStrategy>(`${this.apiUrl}/strategies`, newStrategy, { headers });
  }

  updateStrategy(strategyId: string, strategy: any): Observable<IStrategy> {
    const headers = this.getHeaders();
    return this.httpClient.put<IStrategy>(`${this.apiUrl}/strategies/${strategyId}`, strategy, { headers });
  }

  deleteStrategy(strategyId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.delete(`${this.apiUrl}/strategies/${strategyId}`, { headers });
  }
}
