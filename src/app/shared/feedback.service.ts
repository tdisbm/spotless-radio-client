import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private apiUrl = 'https://localhost/api/feedback';

  constructor(private http: HttpClient) {}

  getFeedbacks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/list`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  }

  addFeedback(user: string, message: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/add`,
      { user, message },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );
  }
}
