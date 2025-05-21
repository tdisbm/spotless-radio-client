import {Injectable} from '@angular/core';
import {io, Socket} from 'socket.io-client';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SioClientService {
  private readonly client: Socket;
  streamSubject: BehaviorSubject<any>;
  playlistSubject: BehaviorSubject<any>;
  micSubject: BehaviorSubject<any>;

  constructor() {
    const authToken: string = localStorage.getItem('token') || '';
    this.client = io('https://localhost', {
      path: '/stream/socket.io',
      transports: ['websocket', 'polling', 'flashsocket'],
      auth: {
        token: authToken
      }
    });

    this.streamSubject = new BehaviorSubject(null);
    this.playlistSubject = new BehaviorSubject(null);
    this.micSubject = new BehaviorSubject(null);

    this.client.on("stream:player:info", (info) => {
      this.playlistSubject.next(info);
    });

    this.client.on("stream:mic:info", (info) => {
      this.micSubject.next(info);
    });

    this.client.on("stream:mixer:info", (info) => {
      this.streamSubject.next(info);
    })

    this.client.on('disconnect', () => {
      this.streamSubject.next(null);
      this.playlistSubject.next(null);
      this.micSubject.next(null);
    })
  }

  openStream(streamId: string) {
    this.client.emit("stream:mixer:open", streamId)
  }

  closeStream(streamId: string) {
    this.client.emit("stream:mixer:close", streamId)
  }

  startPlaylist(streamId: string) {
    this.client.emit("stream:player:open", streamId)
  }

  pausePlaylist(streamId: string) {
    this.client.emit("stream:player:pause", streamId)
  }

  resumePlaylist(streamId: string) {
    this.client.emit("stream:player:resume", streamId)
  }

  stopPlaylist(streamId: string) {
    this.client.emit("stream:player:close", streamId)
  }

  writeMic(streamId: string, buffer: any) {
    this.client.emit('stream:mic:write', {streamId, buffer});
  }
}
