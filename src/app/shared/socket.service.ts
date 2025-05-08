import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3030', {
      auth: { token: localStorage.getItem('token') },
    });
  }

  onPlayerInfo(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('stream:player:info', (info) => observer.next(info));
    });
  }

  onMicInfo(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('stream:mic:info', (info) => observer.next(info));
    });
  }

  openMixer(streamId: string): void {
    this.socket.emit('stream:mixer:open', streamId);
  }

  closeMixer(streamId: string): void {
    this.socket.emit('stream:mixer:close', streamId);
  }

  openPlayer(streamId: string, playlistId?: string, trackId?: string): void {
    this.socket.emit('stream:player:open', { streamId, playlistId, trackId });
  }

  pausePlayer(streamId: string): void {
    this.socket.emit('stream:player:pause', streamId);
  }

  resumePlayer(streamId: string): void {
    this.socket.emit('stream:player:resume', streamId);
  }

  closePlayer(streamId: string): void {
    this.socket.emit('stream:player:close', streamId);
  }

  writeMic(streamId: string, buffer: any): void {
    this.socket.emit('stream:mic:write', { streamId, buffer });
  }
}
