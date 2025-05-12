import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FeedbackService } from '../shared/feedback.service';
import { StreamService } from '../shared/stream.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  imports: [FormsModule],
})
export class LandingComponent implements OnInit {
  feedbackMessage: string = '';
  errorMessage: string | null = null;
  streamStatus: string = 'Stopped';
  streams: any[] = [];
  selectedStreamId: string | null = null;
  volume: number = 50;
  audio: HTMLAudioElement; // Schimbat la HTMLAudioElement (fără | null)
  icecastLink: string | null = null;
  nowPlaying = { artist: 'Artist', song: 'Song' };

  constructor(
    private router: Router,
    private feedbackService: FeedbackService,
    private streamService: StreamService
  ) {
    // Inițializare garantată a audio-ului în constructor
    this.audio = new Audio();
  }

  ngOnInit() {
    this.audio.volume = this.volume / 100;
    this.audio.addEventListener('error', () => {
      this.errorMessage = 'Failed to load audio stream';
      console.error('Audio stream error');
    });
    this.loadStreams();
  }

  loadStreams() {
    this.streamService.getStreams().subscribe({
      next: (data) => {
        this.streams = data;
        if (this.streams.length > 0) {
          this.selectedStreamId = this.streams[0].id;
          this.updateStreamLink();
          this.streamStatus = this.streams[0].enabled ? 'Playing' : 'Stopped';
          if (this.streamStatus === 'Playing') {
            this.playAudio();
          }
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load streams: ' + (err.error?.message || err.message);
        console.error('Failed to load streams:', err);
      },
    });
  }

  updateStreamLink() {
    const stream = this.streams.find(s => s.id === this.selectedStreamId);
    if (stream) {
      this.icecastLink = `http://${stream.publicHost || stream.host}:${stream.port}/${stream.endpoint}`;
      this.audio.src = this.icecastLink;
      if (this.streamStatus === 'Playing') {
        this.playAudio();
      }
    }
  }

  toggleStream() {
    if (!this.selectedStreamId) return;

    if (this.streamStatus === 'Playing' || this.streamStatus === 'Paused') {
      this.streamService.streamAction([this.selectedStreamId], 'pause').subscribe({
        next: () => {
          this.streamStatus = 'Paused';
          this.audio.pause();
          this.loadStreams();
        },
        error: (err) => {
          this.errorMessage = 'Failed to pause stream: ' + (err.error?.message || err.message);
          console.error('Failed to pause stream:', err);
        },
      });
    } else {
      this.streamService.streamAction([this.selectedStreamId], 'resume').subscribe({
        next: () => {
          this.streamStatus = 'Playing';
          this.playAudio();
          this.loadStreams();
        },
        error: (err) => {
          this.errorMessage = 'Failed to resume stream: ' + (err.error?.message || err.message);
          console.error('Failed to resume stream:', err);
        },
      });
    }
  }

  playAudio() {
    this.audio.play().catch(err => {
      this.errorMessage = 'Failed to play audio: ' + err.message;
      console.error('Play error:', err);
    });
  }

  adjustVolume() {
    this.audio.volume = this.volume / 100; // Acum e sigur că audio nu e null
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth']);
  }

  sendFeedback() {
    if (this.feedbackMessage.trim()) {
      this.feedbackService.addFeedback('Guest', this.feedbackMessage).subscribe({
        next: () => {
          this.feedbackMessage = '';
          console.log('Feedback sent!');
        },
        error: (err) => {
          this.errorMessage = 'Failed to send feedback: ' + (err.error?.message || err.message);
          console.error('Failed to send feedback', err);
        },
      });
    }
  }
}
