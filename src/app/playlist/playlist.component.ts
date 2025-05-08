import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PlaylistService } from '../shared/playlist.service';

@Component({
  selector: 'app-playlist',
  standalone: true,
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss'],
  imports: [CommonModule, RouterLink],
})
export class PlaylistComponent implements OnInit {
  playlists: any[] = [];
  selectedPlaylist: any = null;
  errorMessage: string | null = null;

  constructor(private router: Router, private playlistService: PlaylistService) {}

  ngOnInit() {
    this.loadPlaylists();
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

  addPlaylist() {
    const name = prompt('Enter playlist name');
    if (name) {
      this.playlistService.addPlaylist(name).subscribe({
        next: () => this.loadPlaylists(),
        error: (err) => {
          this.errorMessage = 'Failed to add playlist: ' + (err.error?.message || err.message);
          console.error('Failed to add playlist', err);
        },
      });
    }
  }

  deletePlaylist(playlist: any) {
    this.playlistService.deletePlaylist(playlist.id).subscribe({
      next: () => this.loadPlaylists(),
      error: (err) => {
        this.errorMessage = 'Failed to delete playlist: ' + (err.error?.message || err.message);
        console.error('Failed to delete playlist', err);
      },
    });
  }

  viewPlaylist(playlist: any) {
    this.selectedPlaylist = playlist;
  }

  addFileToPlaylist() {
    const fileId = prompt('Enter file ID to add');
    if (fileId) {
      this.playlistService.addFileToPlaylist(this.selectedPlaylist.id, fileId).subscribe({
        next: () => this.loadPlaylists(),
        error: (err) => {
          this.errorMessage = 'Failed to add file to playlist: ' + (err.error?.message || err.message);
          console.error('Failed to add file to playlist', err);
        },
      });
    }
  }

  removeFileFromPlaylist(file: any) {
    this.playlistService.removeFileFromPlaylist(this.selectedPlaylist.id, file.id).subscribe({
      next: () => this.loadPlaylists(),
      error: (err) => {
        this.errorMessage = 'Failed to remove file from playlist: ' + (err.error?.message || err.message);
        console.error('Failed to remove file from playlist', err);
      },
    });
  }
}
