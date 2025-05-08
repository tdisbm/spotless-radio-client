import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {StreamService} from '../shared/stream.service';
import {SioClientService} from '../shared/sio-client.service';
import {forkJoin, Subscription} from 'rxjs';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule],
})
export class AdminComponent implements OnInit, OnDestroy {
  streams: any[] = [];
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

  sioSubs: Subscription[] = [];

  constructor(
    private router: Router,
    private streamService: StreamService,
    private sioClientService: SioClientService
  ) {}

  ngOnInit() {
    this.loadStreams();
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
      this.streamService.getStreams()
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
    }
  }

  togglePlaylist() {
    if (this.selectedStreamId) {
      const isPaused = this.playerState[this.selectedStreamId]?.isPaused
      if (isPaused) {
        this.sioClientService.resumePlaylist(this.selectedStreamId);
      } else {
        this.sioClientService.pausePlaylist(this.selectedStreamId);
      }
    }
  }

  stopPlaylist() {
    if (this.selectedStreamId) {
      this.sioClientService.stopPlaylist(this.selectedStreamId);
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
    if (state === undefined) {
      return true;
    }
    return !!state.isPaused
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

  openStreamInNewPage(streamId: string) {
    for (const stream of this.streams) {
      if (stream.id === streamId) {
        const link = `http://${stream.publicHost}:${stream.port}/${stream.endpoint}`;
        window.open(link, '_blank');
      }
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth']);
  }
}
