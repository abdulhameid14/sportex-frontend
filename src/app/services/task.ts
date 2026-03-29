import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { ITask } from '../interfaces/ITask.js';
import { Auth } from './auth.js';

@Injectable({
  providedIn: 'root'
})
export class Task {
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

  getTasks(currentPage: number, branchName: string, status: string): Observable<ITask[]> {
    const headers = this.getHeaders();
    status = status.toUpperCase();
    if (status === 'ALL') {
      return this.httpClient.get<ITask[]>(`${this.apiUrl}/tasks?[limit]=15&[page]=${currentPage}&[tenantId]=${branchName}`, { headers });
    }
    return this.httpClient.get<ITask[]>(`${this.apiUrl}/tasks?[limit]=15&[page]=${currentPage}&[tenantId]=${branchName}&[status]=${status}`, { headers });
  }

  getTasksByBranch(branchName: string): Observable<ITask[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<ITask[]>(`${this.apiUrl}/tasks?[tenantId]=${branchName}`, { headers });
  }

  getTaskById(taskId: string): Observable<ITask> {
    const headers = this.getHeaders();
    return this.httpClient.get<ITask>(`${this.apiUrl}/tasks/${taskId}`, { headers });
  }

  createTask(task: ITask): Observable<ITask> {
    const headers = this.getHeaders();
    return this.httpClient.post<ITask>(`${this.apiUrl}/tasks`, task, { headers });
  }

  updateTask(taskId: string, task: any): Observable<ITask> {
    const headers = this.getHeaders();
    return this.httpClient.patch<ITask>(`${this.apiUrl}/tasks/${taskId}`, task, { headers });
  }

  deleteTask(taskId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.delete(`${this.apiUrl}/tasks/${taskId}`, { headers });
  }

  submitTask(taskId: string, subAttachments: string[]): Observable<ITask> {
    const headers = this.getHeaders();
    return this.httpClient.post<ITask>(`${this.apiUrl}/tasks/${taskId}/submit`, { 'submissionAttachments': subAttachments }, { headers });
  }

  updateTaskStatus(taskId: string, status: string): Observable<ITask> {
    const headers = this.getHeaders();
    return this.httpClient.patch<ITask>(`${this.apiUrl}/tasks/${taskId}/status`, { 'status': status }, { headers });
  }
}
