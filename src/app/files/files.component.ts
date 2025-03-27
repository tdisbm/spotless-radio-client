import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PlaylistService } from '../shared/playlist.service';

@Component({
  selector: 'app-files',
  standalone: true,
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss'],
  imports: [CommonModule, RouterLink],
})
export class FilesComponent implements OnInit {
  musicFiles = [
    { title: 'Song 1', artist: 'Artist 1', duration: '3:45' },
    { title: 'Song 2', artist: 'Artist 2', duration: '4:12' },
  ];

  playlists: any[] = []; // empty array
  selectedFileForPlaylist: any = null;

  constructor(private router: Router, private playlistService: PlaylistService) {
    this.playlists = this.playlistService.getPlaylists(); // moved the init
  }

  ngOnInit() {
    // for updating the init
  }

  logout() {
    this.router.navigate(['/auth']);
  }

  addFile() {
    const newFile = { title: 'New Song', artist: 'New Artist', duration: '3:00' };
    this.musicFiles.push(newFile);
  }

  deleteFile(file: any) {
    this.musicFiles = this.musicFiles.filter(f => f !== file);
  }

  showPlaylistSelector(file: any) {
    this.selectedFileForPlaylist = file;
  }

  addToPlaylist(file: any, playlist: any) {
    this.playlistService.addFileToPlaylist(playlist, file);
    this.selectedFileForPlaylist = null;
  }
}
