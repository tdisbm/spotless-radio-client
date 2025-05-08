import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StreamService } from '../shared/stream.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  imports: [CommonModule, RouterLink, FormsModule],
})
export class AdminComponent implements OnInit {
  nowPlaying = { artist: 'Artist', song: 'Song' };
  streamStatus: string = 'Stopped';
  streams: any[] = [];
  selectedStreamId: string | null = null;
  selectedStream: any = null;
  icecastLink: string | null = null;
  newStream = {
    name: '',
    host: '',
    port: 0,
    endpoint: '',
    username: '',
    password: '',
    playlistId: '',
  };
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private streamService: StreamService
  ) {}

  ngOnInit() {
    this.loadStreams();
  }

  loadStreams() {
    this.streamService.getStreams().subscribe({
      next: (data) => {
        this.streams = data;
        if (this.streams.length > 0 && !this.selectedStreamId) {
          this.selectedStreamId = this.streams[0].id;
          this.updateSelectedStream();
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load streams: ' + (err.error?.message || err.message);
        console.error('Failed to load streams:', err);
      },
    });
  }

  updateSelectedStream() {
    this.selectedStream = this.streams.find(s => s.id === this.selectedStreamId) || null;
    if (this.selectedStream) {
      this.icecastLink = `http://${this.selectedStream.host}:${this.selectedStream.port}/${this.selectedStream.endpoint}`;
      this.streamStatus = this.selectedStream.enabled ? 'Playing' : 'Stopped';
    } else {
      this.icecastLink = null;
      this.streamStatus = 'Stopped';
    }
  }

  startStream() {
    if (this.selectedStreamId) {
      this.streamService.streamAction([this.selectedStreamId], 'start').subscribe({
        next: () => {
          this.streamStatus = 'Playing';
          this.loadStreams();
        },
        error: (err) => {
          this.errorMessage = 'Failed to start stream: ' + (err.error?.message || err.message);
          console.error('Failed to start stream:', err);
        },
      });
    }
  }

  pauseStream() {
    if (this.selectedStreamId) {
      this.streamService.streamAction([this.selectedStreamId], 'pause').subscribe({
        next: () => {
          this.streamStatus = 'Paused';
          this.loadStreams();
        },
        error: (err) => {
          this.errorMessage = 'Failed to pause stream: ' + (err.error?.message || err.message);
          console.error('Failed to pause stream:', err);
        },
      });
    }
  }

  resumeStream() {
    if (this.selectedStreamId) {
      this.streamService.streamAction([this.selectedStreamId], 'resume').subscribe({
        next: () => {
          this.streamStatus = 'Playing';
          this.loadStreams();
        },
        error: (err) => {
          this.errorMessage = 'Failed to resume stream: ' + (err.error?.message || err.message);
          console.error('Failed to resume stream:', err);
        },
      });
    }
  }

  stopStream() {
    if (this.selectedStreamId) {
      this.streamService.streamAction([this.selectedStreamId], 'stop').subscribe({
        next: () => {
          this.streamStatus = 'Stopped';
          this.loadStreams();
        },
        error: (err) => {
          this.errorMessage = 'Failed to stop stream: ' + (err.error?.message || err.message);
          console.error('Failed to stop stream:', err);
        },
      });
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
        console.error('Failed to create stream:', err);
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
          console.error('Failed to update stream:', err);
        },
      });
    }
  }

  deleteStream() {
    if (this.selectedStreamId) {
      this.streamService.deleteStreams([this.selectedStreamId]).subscribe({
        next: () => {
          this.selectedStreamId = null;
          this.selectedStream = null;
          this.icecastLink = null;
          this.loadStreams();
        },
        error: (err) => {
          this.errorMessage = 'Failed to delete stream: ' + (err.error?.message || err.message);
          console.error('Failed to delete stream:', err);
        },
      });
    }
  }

  resetNewStream() {
    this.newStream = {
      name: '',
      host: '',
      port: 0,
      endpoint: '',
      username: '',
      password: '',
      playlistId: '',
    };
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth']);
  }
}
