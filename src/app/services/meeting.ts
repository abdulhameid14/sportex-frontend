import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { IMeeting } from '../interfaces/IMeeting';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root'
})
export class Meeting {
  apiUrl = environment.apiUrl;

  constructor(
    private httpClient: HttpClient,
    private authService: Auth
  ) {}

  private getHeaders(): HttpHeaders | undefined {
    const token = this.authService.getToken();
    if (!token) {
      // No token found — return undefined so callers can decide whether to send headers
      return undefined;
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

getMeetings(
  currentPage: number,
  tenantId: string,
  search: string = ''
): Observable<IMeeting[]> {

  const headers = this.getHeaders();

  return this.httpClient.get<any>(
    `${this.apiUrl}/meetings?[limit]=15&page=${currentPage}&[tenantId]=${tenantId}&[search]=${search}`,
    headers ? { headers } : {}
  ).pipe(
    map((res: any) => {
      console.log(res.meetings);

      // Normalize response shapes: array | { meetings: [...] } | { data: [...] } | { items: [...] }

      return res.meetings ;
    })
  );
}


  getMeetingsByTenant(tenantId: string): Observable<IMeeting[]> {
    const headers = this.getHeaders();
    return this.httpClient.get<any>(
      `${this.apiUrl}/meetings?[limit]=100000&[tenantId]=${tenantId}`,
      headers ? { headers } : {}
    ).pipe(
      map((res: any) => Array.isArray(res) ? res : res?.meetings || res?.data || res?.items || [])
    );
  }

  getMeetingById(meetingId: string): Observable<IMeeting> {
    const headers = this.getHeaders();
    return this.httpClient.get<IMeeting>(
      `${this.apiUrl}/meetings/${meetingId}`,
      headers ? { headers } : {}
    );
  }

  createMeeting(meeting: IMeeting): Observable<IMeeting> {
    const headers = this.getHeaders();
    return this.httpClient.post<IMeeting>(
      `${this.apiUrl}/meetings`,
      meeting,
      { headers }
    );
  }

  updateMeeting(meetingId: string, meeting: Partial<IMeeting>): Observable<IMeeting> {
    const headers = this.getHeaders();
    return this.httpClient.put<IMeeting>(
      `${this.apiUrl}/meetings/${meetingId}`,
      meeting,
      { headers }
    );
  }

  deleteMeeting(meetingId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient.delete(
      `${this.apiUrl}/meetings/${meetingId}`,
      { headers }
    );
  }
}
