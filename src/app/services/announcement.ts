import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { IAnnouncement } from '../interfaces/IAnnouncement.js';
import { Auth } from './auth.js';

@Injectable({
  providedIn: 'root'
})
export class Announcement {
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

  getAnnouncements(currentPage: number, branchName: string): Observable<IAnnouncement[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<IAnnouncement[]>(`${this.apiUrl}/announcements?[limit]=15&page=${currentPage}&[tenantId]=${branchName}`, { headers });
  }

  getAllAnnouncements(branchName: string): Observable<IAnnouncement[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<IAnnouncement[]>(`${this.apiUrl}/announcements?[limit]=100000&[tenantId]=${branchName}`, { headers });
  }

  getAnnouncementById(announcementId: number): Observable<IAnnouncement> {
    const headers = this.getHeaders();
    return this.httpClient.get<IAnnouncement>(`${this.apiUrl}/announcements/${announcementId}`, { headers });
  }

  createAnnouncement(newAnnouncement: IAnnouncement): Observable<IAnnouncement> {
    const headers = this.getHeaders();
    return this.httpClient.post<IAnnouncement>(`${this.apiUrl}/announcements`, newAnnouncement, { headers });
  }

  updateAnnouncement(announcementId: string, announcement: any): Observable<IAnnouncement> {
    const headers = this.getHeaders();
    return this.httpClient.put<IAnnouncement>(`${this.apiUrl}/announcements/${announcementId}`, announcement, { headers });
  }

  deleteAnnouncement(announcementId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.delete(`${this.apiUrl}/announcements/${announcementId}`, { headers });
  }

}
