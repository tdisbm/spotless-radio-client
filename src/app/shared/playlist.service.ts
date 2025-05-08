import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  private apiUrl = 'http://localhost:3000/playlist';

  constructor(private http: HttpClient) {}

  getPlaylists(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/list`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  }

  addPlaylist(name: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/create`,
      { name, description: '', coverImage: '', tracks: [] },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );
  }

  deletePlaylist(playlistId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: { playlistId },
    });
  }

  addFileToPlaylist(playlistId: string, fileId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/update`,
      { id: playlistId, tracks: [{ id: fileId, sortOrder: 0 }] },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );
  }

  removeFileFromPlaylist(playlistId: string, fileId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/update`,
      { id: playlistId, tracks: [] },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );
  }
}
