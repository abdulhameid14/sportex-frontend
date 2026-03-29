import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { IUser } from '../interfaces/IUser.js';
import { Auth } from './auth.js';
import { IUnsignedDocs } from '../interfaces/IUnsignedDocs';

@Injectable({
  providedIn: 'root'
})
export class User {
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

  getUsers(branchName: string): Observable<IUser[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<IUser[]>(`${this.apiUrl}/users?tenantId=${branchName}`, { headers });
  }

  getCurrentUser(): Observable<IUser> {
    const headers = this.getHeaders();
    return this.httpClient.get<IUser>(`${this.apiUrl}/users/me`, { headers });
  }

  getUserById(userId: string): Observable<IUser> {
    const headers = this.getHeaders();
    return this.httpClient.get<IUser>(`${this.apiUrl}/users/${userId}`, { headers });
  }

  getUnsignedDocs(page: number): Observable<any[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<any[]>(`${this.apiUrl}/users/documents-to-sign?limit=15&page=${page}`, { headers });
  }

  getDocsByBranch(branchName: string): Observable<any[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<any[]>(`${this.apiUrl}/users/uploads/${branchName}`, { headers });
  }

  getAllDocs(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<any[]>(`${this.apiUrl}/users/uploads`, { headers });
  }

  getMyDocs(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<any[]>(`${this.apiUrl}/users/my-uploads`, { headers });
  }

  signDocs(request: any) : Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.post<any>(`${this.apiUrl}/users/sign-document`, request, { headers });
  }

  uploadFiles(files: any): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.post<any>(`${this.apiUrl}/users/upload`, files, { headers });
  }

  createUser(user: any): Observable<IUser> {
    const headers = this.getHeaders();
    return this.httpClient.post<IUser>(`${this.apiUrl}/users`, user, { headers });
  }

  updateUser(userId: string, user: any): Observable<IUser> {
    const headers = this.getHeaders();
    return this.httpClient.patch<IUser>(`${this.apiUrl}/users/${userId}`, user, { headers });
  }

  updateMyData(user: any): Observable<IUser> {
    const headers = this.getHeaders();
    return this.httpClient.patch<IUser>(`${this.apiUrl}/users/me`, user, { headers });
  }

  deleteUser(userId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.delete(`${this.apiUrl}/users/${userId}`, { headers });
  }

  openFile(url: string) {
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      });
  }
}
