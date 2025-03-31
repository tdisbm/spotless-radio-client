import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  imports: [CommonModule, RouterLink],
})
export class AdminComponent {
  nowPlaying = {
    artist: 'Artist',
    song: 'Song',
  };

  constructor(private router: Router) {}

  logout() {
    this.router.navigate(['/auth']);
  }
}
