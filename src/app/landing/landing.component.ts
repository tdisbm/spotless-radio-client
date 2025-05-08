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
  audio: HTMLAudioElement | null = null;
  icecastLink: string | null = null;
  nowPlaying = { artist: 'Artist', song: 'Song' };

  constructor(
    private router: Router,
    private feedbackService: FeedbackService,
    private streamService: StreamService
  ) {}

  ngOnInit() {
    this.loadStreams();
    this.audio = new Audio();
    this.audio.volume = this.volume / 100;
  }

  loadStreams() {
    this.streamService.getStreams().subscribe({
      next: (data) => {
        this.streams = data;
        if (this.streams.length > 0) {
          this.selectedStreamId = this.streams[0].id;
          this.updateStreamLink();
          this.streamStatus = this.streams[0].enabled ? 'Playing' : 'Stopped';
          if (this.streamStatus === 'Playing' && this.audio) {
            this.audio.play();
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
      this.icecastLink = `http://${stream.host}:${stream.port}/${stream.endpoint}`;
      if (this.audio) {
        this.audio.src = this.icecastLink;
      }
    }
  }

  toggleStream() {
    if (!this.selectedStreamId) return;

    if (this.streamStatus === 'Playing') {
      this.streamService.streamAction([this.selectedStreamId], 'pause').subscribe({
        next: () => {
          this.streamStatus = 'Paused';
          this.audio?.pause();
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
          this.audio?.play();
          this.loadStreams();
        },
        error: (err) => {
          this.errorMessage = 'Failed to resume stream: ' + (err.error?.message || err.message);
          console.error('Failed to resume stream:', err);
        },
      });
    }
  }

  adjustVolume() {
    if (this.audio) {
      this.audio.volume = this.volume / 100;
    }
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
