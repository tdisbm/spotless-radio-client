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
  playlists: any[] = []; // empty array init
  selectedPlaylist: any = null;

  constructor(private router: Router, private playlistService: PlaylistService) {
    this.playlists = this.playlistService.getPlaylists(); // move the init here
  }

  ngOnInit() {
    //will put here the init
  }

  logout() {
    this.router.navigate(['/auth']);
  }

  addPlaylist() {
    this.playlistService.addPlaylist(`Playlist ${this.playlists.length + 1}`);
  }

  deletePlaylist(playlist: any) {
    this.playlistService.deletePlaylist(playlist);
  }

  viewPlaylist(playlist: any) {
    this.selectedPlaylist = playlist;
  }

  addFileToPlaylist() {
    const newFile = { title: 'New Song', artist: 'New Artist', duration: '3:00' };
    this.playlistService.addFileToPlaylist(this.selectedPlaylist, newFile);
  }

  removeFileFromPlaylist(file: any) {
    this.playlistService.removeFileFromPlaylist(this.selectedPlaylist, file);
  }
}
