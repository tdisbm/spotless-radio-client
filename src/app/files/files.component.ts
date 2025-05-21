import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FileService } from '../shared/file.service';
import { PlaylistService } from '../shared/playlist.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-files',
  standalone: true,
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss'],
  imports: [CommonModule, RouterLink],
})
export class FilesComponent implements OnInit {
  musicFiles: any[] = [];
  playlists: any[] = [];
  selectedFileForPlaylist: any = null;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private fileService: FileService,
    private playlistService: PlaylistService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadFiles();
    this.loadPlaylists();
  }

  loadFiles() {
    const token = localStorage.getItem('token');
    this.fileService.getFiles().subscribe({
      next: (data) => {
        this.musicFiles = data.map((file: any) => ({
          id: file.id,
          name: file.name,
          title: file.metadata?.title || 'Untitled',
          artist: file.metadata?.artist || 'Unknown',
          album: file.metadata?.album || 'Unknown',
        }));
      },
      error: (err) => {
        this.errorMessage = 'Failed to load files: ' + (err.error?.message || err.message);
        console.error('Failed to load files', err);
      },
    });
  }

  loadPlaylists() {
    this.playlistService.getPlaylists().subscribe({
      next: (data) => {
        this.playlists = data;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load playlists: ' + (err.error?.message || err.message);
        console.error('Failed to load playlists', err);
      },
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth']);
  }

  addFile() {
    const token = localStorage.getItem('token');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.multiple = true;
    input.onchange = (event: Event) => {
      const fileInput = event.target as HTMLInputElement;
      if (fileInput.files && fileInput.files.length > 0) {
        const formData = new FormData();
        const filesArray = Array.from(fileInput.files);
        filesArray.forEach((file, index) => {
          formData.append('files', file);
        });

        this.http.post('https://localhost/api/track/upload', formData, {
          headers: { Authorization: `Bearer ${token}` },
        }).subscribe({
          next: () => {
            this.loadFiles();
            this.router.navigate(['/music-files']);
          },
          error: (err) => {
            this.errorMessage = 'Failed to upload file: ' + (err.error?.message || err.message);
            console.error('Failed to upload file', err);
          },
        });
      }
    };
    input.click();
  }

  deleteFile(file: any) {
    const token = localStorage.getItem('token');
    const trackIds = [file.id];
    this.fileService.deleteFile(trackIds).subscribe({
      next: () => this.loadFiles(),
      error: (err) => {
        this.errorMessage = 'Failed to delete file: ' + (err.error?.message || err.message);
        console.error('Failed to delete file', err);
      },
    });
  }

  showPlaylistSelector(file: any) {
    this.selectedFileForPlaylist = file;
  }

  addToPlaylist(file: any, playlist: any) {
    this.playlistService.addFileToPlaylist(playlist.id, file.id).subscribe({
      next: () => {
        this.selectedFileForPlaylist = null;
        this.loadPlaylists();
      },
      error: (err) => {
        this.errorMessage = 'Failed to add file to playlist: ' + (err.error?.message || err.message);
        console.error('Failed to add file to playlist', err);
      },
    });
  }
}
