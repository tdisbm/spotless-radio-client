import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {StreamService} from '../shared/stream.service';
import {SioClientService} from '../shared/sio-client.service';
import {PlaylistService} from '../shared/playlist.service';
import {forkJoin, Subscription} from 'rxjs';
import {MatIconModule} from '@angular/material/icon';
import { SafeUrlPipe } from '../shared/safe-url.pipe';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule, SafeUrlPipe],
})
export class AdminComponent implements OnInit, OnDestroy {
  streams: any[] = [];
  playlists: any[] = [];
  selectedStreamId: string = '';
  selectedStream: any = null;
  errorMessage: string | null = null;
  newStream = {
    name: '',
    host: '',
    publicHost: '',
    port: 0,
    endpoint: '',
    username: '',
    password: '',
    playlistId: '',
  };

  playerState: any = {};
  mixerState: any = {};
  micState: any = {};
  showPlayer: boolean = false;

  sioSubs: Subscription[] = [];

  constructor(
    private router: Router,
    private streamService: StreamService,
    private sioClientService: SioClientService,
    private playlistService: PlaylistService
  ) {}

  ngOnInit() {
    this.loadStreams();
    this.loadPlaylists();
    this.sioSubs.push(this.sioClientService.streamSubject.subscribe((info) => {
      if (info) {
        this.mixerState[info.streamId] = info.state;
      }
    }));

    this.sioSubs.push(this.sioClientService.playlistSubject.subscribe((info) => {
      if (info?.streamId) {
        this.playerState[info.streamId] = info.state;
      }
    }));

    this.sioSubs.push(this.sioClientService.micSubject.subscribe((info) => {
      if (info?.streamId) {
        this.micState[info.streamId] = info?.state;
      }
    }));
  }

  ngOnDestroy() {
    for (const sub of this.sioSubs) {
      sub.unsubscribe();
    }
  }

  loadStreams() {
    forkJoin([
      this.streamService.getStats(),
      this.streamService.getStreams(),
    ]).subscribe({
      next: ([stats, streams]) => {
        this.initStats(stats);
        this.streams = streams as any;
        if (this.streams.length > 0 && !this.selectedStreamId) {
          this.selectedStreamId = this.streams[0].id;
          this.updateSelectedStream();
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load streams: ' + (err.error?.message || err.message);
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

  updateSelectedStream() {
    this.selectedStream = this.streams.find(s => s.id === this.selectedStreamId) || null;
  }

  openStream() {
    if (this.selectedStreamId) {
      this.sioClientService.openStream(this.selectedStreamId);
    }
  }

  closeStream() {
    if (this.selectedStreamId) {
      this.sioClientService.closeStream(this.selectedStreamId);
      this.showPlayer = false;
    }
  }

  togglePlaylist() {
    if (this.selectedStreamId) {
      const isPaused = this.playerState[this.selectedStreamId]?.isPaused;
      if (isPaused) {
        this.sioClientService.resumePlaylist(this.selectedStreamId);
        this.showPlayer = true;
      } else {
        this.sioClientService.pausePlaylist(this.selectedStreamId);
      }
      this.updatePlayerUrl();
    }
  }

  stopPlaylist() {
    if (this.selectedStreamId) {
      this.sioClientService.stopPlaylist(this.selectedStreamId);
      this.showPlayer = false;
    }
  }

  createStream() {
    const streamData = { ...this.newStream };
    this.streamService.createStream(streamData).subscribe({
      next: () => {
        this.loadStreams();
        this.resetNewStream();
      },
      error: (err) => {
        this.errorMessage = 'Failed to create stream: ' + (err.error?.message || err.message);
      },
    });
  }

  updateStream() {
    if (this.selectedStream) {
      const updatedData = { ...this.selectedStream };
      this.streamService.updateStream(updatedData).subscribe({
        next: () => this.loadStreams(),
        error: (err) => {
          this.errorMessage = 'Failed to update stream: ' + (err.error?.message || err.message);
        },
      });
    }
  }

  deleteStream() {
    if (this.selectedStreamId) {
      this.streamService.deleteStreams([this.selectedStreamId]).subscribe({
        next: () => {
          this.selectedStreamId = '';
          this.selectedStream = null;
          this.loadStreams();
          this.showPlayer = false; // Ascunde player-ul când stream-ul este șters
        },
        error: (err) => {
          this.errorMessage = 'Failed to delete stream: ' + (err.error?.message || err.message);
        },
      });
    }
  }

  resetNewStream() {
    this.newStream = {
      name: '',
      host: '',
      publicHost: '',
      port: 0,
      endpoint: '',
      username: '',
      password: '',
      playlistId: '',
    };
  }

  isMixerOpen(streamId: string) {
    const state = this.mixerState[streamId];
    return !!state?.isOpen;
  }

  isMicActive(streamId: string) {
    const state = this.micState[streamId];
    return !!state?.isActive;
  }

  isPlaylistPaused(streamId: string) {
    const state = this.playerState[streamId];
    if (state === undefined || state === null) {
      return true;
    }
    return !!state.isPaused;
  }

  initStats(rawStats: any) {
    for (const cid in rawStats) {
      const sources: any = rawStats[cid];
      if (sources.hasOwnProperty('mixer')) {
        this.mixerState[cid] = sources['mixer'];
      }
      if (sources.hasOwnProperty('player')) {
        this.playerState[cid] = sources['player'];
      }
      if (sources.hasOwnProperty('mic')) {
        this.micState[cid] = sources['mic'];
      }
    }
  }

  getCurrentSong(streamId: string) {
    const currentTrack = this.playerState[streamId]?.currentTrack;
    if (currentTrack) {
      return currentTrack.name.split('.')[0];
    }
    return 'Unknown';
  }

  updatePlayerUrl() {
    if (this.selectedStream && this.showPlayer) {
      const stream = this.streams.find(s => s.id === this.selectedStreamId);
      if (stream) {
        return `http://${stream.publicHost}/live/${stream.endpoint}`;
      }
    }
    return '';
  }

  openStreamInNewPage(streamId: string) {
    for (const stream of this.streams) {
      if (stream.id === streamId) {
        const link = `http://${stream.publicHost}/live/${stream.endpoint}`;
        window.open(link, '_blank');
      }
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth']);
  }
}
