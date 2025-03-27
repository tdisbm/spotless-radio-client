import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { AuthComponent } from './auth/auth.component';
import { AdminComponent } from './admin/admin.component';
import { FilesComponent } from './files/files.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { FeedbackComponent } from './feedback/feedback.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'music-files', component: FilesComponent },
  { path: 'playlist', component: PlaylistComponent },
  { path: 'feedback', component: FeedbackComponent },
];
