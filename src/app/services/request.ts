import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { IRequest, IRequestType, IRequestTypeSigners } from '../interfaces/IRequest.js';
import { Auth } from './auth.js';
import { stat } from 'fs';

@Injectable({
  providedIn: 'root'
})
export class Request {
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

  getRequests(currentPage: number, branchName: string, status: string): Observable<IRequest[]> {
    const headers = this.getHeaders();
    status = status.toUpperCase();
    if (status === 'ALL') {
      return this.httpClient.get<IRequest[]>(`${this.apiUrl}/requests?[limit]=15&page=${currentPage}&[tenantId]=${branchName}`, { headers });
    }
    return this.httpClient.get<IRequest[]>(`${this.apiUrl}/requests?[limit]=15&page=${currentPage}&[tenantId]=${branchName}&[status]=${status}`, { headers });
  }

  getRequestTypes(branchName: string): Observable<IRequestType[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<IRequestType[]>(`${this.apiUrl}/requests/request-types?tenantId=${branchName}`, { headers });
  }

  getRequestById(requestId: string): Observable<IRequest> {
    const headers = this.getHeaders();
    return this.httpClient.get<IRequest>(`${this.apiUrl}/requests/${requestId}`, { headers });
  }


  createRequest(request: IRequest): Observable<IRequest> {
    const headers = this.getHeaders();
    return this.httpClient.post<IRequest>(`${this.apiUrl}/requests`, request, { headers });
  }

  createRequestType(requestType: IRequestType): Observable<IRequestType> {
    const headers = this.getHeaders();
    return this.httpClient.post<IRequestType>(`${this.apiUrl}/admin/request-types`, requestType, { headers });
  }

  createRequestSigners(signers: IRequestTypeSigners): Observable<IRequestTypeSigners> {
    const headers = this.getHeaders();
    return this.httpClient.post<IRequestTypeSigners>(`${this.apiUrl}/admin/request-signers`, signers, { headers });
  }

  updateRequest(requestId: string, request: any): Observable<IRequest> {
    const headers = this.getHeaders();
    return this.httpClient.patch<IRequest>(`${this.apiUrl}/requests/${requestId}`, request, { headers });
  }

  updateRequestType(requestTypeId: string, requestType: any): Observable<IRequest> {
    const headers = this.getHeaders();
    return this.httpClient.patch<IRequest>(`${this.apiUrl}/admin/request-types/${requestTypeId}`, requestType, { headers });
  }

  deleteRequest(requestId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.delete(`${this.apiUrl}/requests/${requestId}`, { headers });
  }

  deleteRequestType(requestTypeId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.delete(`${this.apiUrl}/admin/request-types/${requestTypeId}`, { headers });
  }
}
