import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  private playlists = [
    { name: 'Chill Vibes', files: [{ title: 'Song 1', artist: 'Artist 1', duration: '3:45' }] },
    { name: 'Workout Mix', files: [{ title: 'Song 2', artist: 'Artist 2', duration: '4:12' }] },
  ];

  getPlaylists() {
    return this.playlists;
  }

  addPlaylist(name: string) {
    this.playlists.push({ name, files: [] });
  }

  deletePlaylist(playlist: any) {
    this.playlists = this.playlists.filter(p => p !== playlist);
  }

  addFileToPlaylist(playlist: any, file: any) {
    playlist.files.push(file);
  }

  removeFileFromPlaylist(playlist: any, file: any) {
    playlist.files = playlist.files.filter((f: any) => f !== file);
  }
}
