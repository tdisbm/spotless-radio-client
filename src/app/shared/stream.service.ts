import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StreamService {
  private apiUrl = 'http://localhost:3000/stream';

  constructor(private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getStreams(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/list`, {headers: this.getHeaders()});
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`, {headers: this.getHeaders()});
  }

  createStream(streamData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, streamData, {headers: this.getHeaders()});
  }

  updateStream(streamData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, streamData, {headers: this.getHeaders()});
  }

  deleteStreams(streamIds: string[]): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete`, {
      headers: this.getHeaders(),
      body: {streamIds}
    });
  }

  streamAction(streamIds: string[], action: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/action`, {streamIds, action}, {headers: this.getHeaders()});
  }
}
