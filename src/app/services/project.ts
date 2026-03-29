import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { IProject } from '../interfaces/IProject.js';
import { Auth } from './auth.js';

@Injectable({
  providedIn: 'root'
})
export class Project {
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

  getProjects(currentPage: number, branchName: string): Observable<IProject[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<IProject[]>(`${this.apiUrl}/projects?[limit]=15&page=${currentPage}&[tenantId]=${branchName}`, { headers });
  }

    getProjectsByBranch(branchName: string): Observable<IProject[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<IProject[]>(`${this.apiUrl}/projects?[limit]=100000&[tenantId]=${branchName}`, { headers });
  }

  getProjectById(projectId: string): Observable<IProject> {
    const headers = this.getHeaders();
    return this.httpClient.get<IProject>(`${this.apiUrl}/projects/${projectId}`, { headers });
  }

  createProject(newProject: IProject): Observable<IProject> {
    const headers = this.getHeaders();
    return this.httpClient.post<IProject>(`${this.apiUrl}/projects`, newProject, { headers });
  }

  updateProject(projectId: string, project: any): Observable<IProject> {
    const headers = this.getHeaders();
    return this.httpClient.put<IProject>(`${this.apiUrl}/projects/${projectId}`, project, { headers });
  }

  deleteProject(projectId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.delete(`${this.apiUrl}/projects/${projectId}`, { headers });
  }
}
