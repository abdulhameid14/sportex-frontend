import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { Auth } from './auth';
import { ICustomTables } from '../interfaces/ICustomTables';

@Injectable({
  providedIn: 'root'
})
export class CustomTables {

  apiUrl = environment.apiUrl;

  constructor(
    private httpClient: HttpClient,
    private authService: Auth
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getCustomTables(): Observable<ICustomTables[]> {
    const headers = this.getHeaders();

    return this.httpClient
      .get<any>(`${this.apiUrl}/custom-tables?[limit]=100000`, { headers })
      .pipe(map(res => res.data));
  }

  getCustomTableById(tableId: string): Observable<ICustomTables> {
    const headers = this.getHeaders();
    return this.httpClient
      .get<any>(`${this.apiUrl}/custom-tables/${tableId}`, { headers })
      .pipe(map(res => res.data));
  }

  getRecords(tableId: string): Observable<any[]> {
    const headers = this.getHeaders();
    return this.httpClient
      .get<any>(`${this.apiUrl}/custom-tables/${tableId}/records?[limit]=100000`, { headers })
      .pipe(map(res => res.data));
  }

  createRecord(tableId: string, payload: any): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient
      .post<any>(`${this.apiUrl}/custom-tables/${tableId}/rows`, payload, { headers });
  }

  deleteRecord(tableId: string, recordId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.httpClient
      .delete<any>(`${this.apiUrl}/custom-tables/${tableId}/records/${recordId}`, { headers });
  }

  voteOnRecord(tableId: string, recordId: string, vote: string, comment: string): Observable<any> {
    const headers = this.getHeaders();
    const payload = { vote, comment };
    const primaryUrl = `${this.apiUrl}/custom-tables/${tableId}/records/${recordId}/vote`;
    const altUrlRows = `${this.apiUrl}/custom-tables/${tableId}/rows/${recordId}/vote`;
    const altUrlNoTable = `${this.apiUrl}/custom-tables/records/${recordId}/vote`;

    // Log constructed URLs to help debugging in browser console
    try {
      // eslint-disable-next-line no-console
      console.debug('voteOnRecord urls', { primaryUrl, altUrlRows, altUrlNoTable, payload });
    } catch (e) {}

    return this.httpClient.post<any>(primaryUrl, payload, { headers }).pipe(
      catchError(err => {
        if (err?.status === 404) {
          // try alternate URL with `rows`
          return this.httpClient.post<any>(altUrlRows, payload, { headers }).pipe(
            catchError(err2 => {
              if (err2?.status === 404) {
                // try alternate URL without tableId
                return this.httpClient.post<any>(altUrlNoTable, payload, { headers }).pipe(
                  catchError(err3 => throwError(() => err3))
                );
              }
              return throwError(() => err2);
            })
          );
        }
        return throwError(() => err);
      })
    );
  }

  uploadFile(file: File): Observable<any> {
    const headers = this.getHeaders();
    const formData = new FormData();
    formData.append('file', file);
    return this.httpClient.post<any>(
      `${this.apiUrl}/upload`,
      formData,
      { headers }
    );
  }
}
