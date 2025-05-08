import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { AuthComponent } from './auth/auth.component';
import { AdminComponent } from './admin/admin.component';
import { FilesComponent } from './files/files.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { AuthGuard } from './shared/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { path: 'radio', component: LandingComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
  { path: 'music-files', component: FilesComponent, canActivate: [AuthGuard] },
  { path: 'playlist', component: PlaylistComponent, canActivate: [AuthGuard] },
  { path: 'feedback', component: FeedbackComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/auth' }
];
