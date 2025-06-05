import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FeedbackService } from '../shared/feedback.service';
import { StreamService } from '../shared/stream.service';
import { SioClientService } from '../shared/sio-client.service';
import { Subscription } from 'rxjs';
import { decodeToken } from '../shared/jwt.utils';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  imports: [FormsModule],
})
export class LandingComponent implements OnInit, OnDestroy {
  feedbackMessage: string = '';
  errorMessage: string | null = null;
  streamStatus: string = 'Stopped';
  streams: any[] = [];
  selectedStreamId: string | null = null;
  volume: number = 50;
  audio: HTMLAudioElement;
  icecastLink: string | null = null;
  nowPlaying = { artist: 'Unknown Artist', song: 'Unknown Song' };
  userEmail: string = 'Guest';
  mixerState: any = {};
  playerState: any = {};
  sioSubs: Subscription[] = [];

  constructor(
    private router: Router,
    private feedbackService: FeedbackService,
    private streamService: StreamService,
    private sioClientService: SioClientService
  ) {
    this.audio = new Audio();
  }

  ngOnInit() {
    this.audio.volume = this.volume / 100;
    this.audio.addEventListener('error', () => {
      this.errorMessage = 'Failed to load audio stream';
      console.error('Audio stream error');
    });
    this.loadStreams();
    this.loadUserEmail();
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    this.sioSubs.push(
      this.sioClientService.streamSubject.subscribe((info) => {
        if (info) {
          this.mixerState[info.streamId] = info.state;
          if (!this.isMixerOpen(this.selectedStreamId)) {
            this.streamStatus = 'Stopped';
            this.audio.pause();
          }
        }
      })
    );

    this.sioSubs.push(
      this.sioClientService.playlistSubject.subscribe((info) => {
        if (info?.streamId) {
          this.playerState[info.streamId] = info.state;
          if (info.state.currentTrack) {
            this.nowPlaying = {
              artist: info.state.currentTrack.artist || 'Unknown Artist',
              song: info.state.currentTrack.name.split('.')[0] || 'Unknown Song',
            };
          }
          if (this.isMixerOpen(info.streamId)) {
            this.streamStatus = info.state.isPaused ? 'Paused' : 'Playing';
          }
        }
      })
    );
  }

  ngOnDestroy() {
    this.sioSubs.forEach((sub) => sub.unsubscribe());
  }

  loadUserEmail() {
    const token = localStorage.getItem('token');
    const decoded = decodeToken(token);
    this.userEmail = decoded?.email || 'Guest';
  }

  loadStreams() {
    this.streamService.getStreams().subscribe({
      next: (data) => {
        this.streams = data;
        if (this.streams.length > 0) {
          this.selectedStreamId = this.streams[0].id;
          this.updateStreamLink();
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load streams: ' + (err.error?.message || err.message);
        console.error('Failed to load streams:', err);
      },
    });
  }

  updateStreamLink() {
    const stream = this.streams.find((s) => s.id === this.selectedStreamId);
    if (stream) {
      this.icecastLink = `https://localhost:8000/${stream.endpoint || 'live/teststream'}`;
      console.log('Icecast Link:', this.icecastLink);
      if (this.icecastLink) {
        this.audio.src = this.icecastLink;
      }
    }
  }

  toggleStream() {
    if (!this.selectedStreamId) {
      this.errorMessage = 'No stream selected.';
      return;
    }

    if (!this.isMixerOpen(this.selectedStreamId)) {
      this.errorMessage = 'Stream is not open. Please contact an admin.';
      this.streamStatus = 'Stopped';
      this.audio.pause();
      return;
    }

    const isPaused = this.isPlaylistPaused(this.selectedStreamId);
    if (isPaused) {
      this.streamService.streamAction([this.selectedStreamId], 'resume').subscribe({
        next: () => {
          this.streamStatus = 'Playing';
          this.playAudio();
        },
        error: (err) => {
          this.errorMessage = 'Failed to resume stream: ' + (err.error?.message || err.message);
          console.error('Failed to resume stream:', err);
          this.streamStatus = 'Paused';
        },
      });
    } else {
      this.streamService.streamAction([this.selectedStreamId], 'pause').subscribe({
        next: () => {
          this.streamStatus = 'Paused';
          this.audio.pause();
        },
        error: (err) => {
          this.errorMessage = 'Failed to pause stream: ' + (err.error?.message || err.message);
          console.error('Failed to pause stream:', err);
          this.streamStatus = 'Playing';
        },
      });
    }
  }

  isMixerOpen(streamId: string | null): boolean {
    if (!streamId) return false;
    return !!this.mixerState[streamId]?.isOpen;
  }

  isPlaylistPaused(streamId: string | null): boolean {
    if (!streamId) return true;
    const state = this.playerState[streamId];
    return state ? !!state.isPaused : true;
  }

  playAudio() {
    this.audio.play().catch((err) => {
      this.errorMessage = 'Failed to play audio: ' + err.message;
      console.error('Play error:', err.message, err);
    });
  }

  adjustVolume() {
    this.audio.volume = this.volume / 100;
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth']);
  }

  sendFeedback() {
    if (this.feedbackMessage.trim()) {
      this.feedbackService.addFeedback(this.userEmail, this.feedbackMessage).subscribe({
        next: () => {
          this.feedbackMessage = '';
          this.errorMessage = null;
          console.log('Feedback sent!');
        },
        error: (err) => {
          this.errorMessage = 'Failed to send feedback: ' + err.message;
          console.error('Failed to send feedback', err);
        },
      });
    } else {
      this.errorMessage = 'Feedback cannot be empty!';
    }
  }
}
