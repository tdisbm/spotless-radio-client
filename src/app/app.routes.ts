import {Routes} from '@angular/router';
import {AuthComponent} from './auth/auth.component';
import {LandingComponent} from './landing/landing.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'auth',
    component: AuthComponent,
  },
];
