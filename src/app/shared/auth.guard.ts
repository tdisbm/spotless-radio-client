import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/auth']);
      return false;
    }

    const roles = JSON.parse(localStorage.getItem('roles') || '[]') as string[];
    const routeUrl = route.routeConfig?.path || '';

    if (routeUrl === 'admin' && !roles.includes('ADMIN')) {
      this.router.navigate(['/auth']);
      return false;
    }

    return true;
  }
}
