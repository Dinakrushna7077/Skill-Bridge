import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { UserRole } from '../models/schema.models';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = function (): boolean {
  var auth = inject(AuthService);
  var router = inject(Router);

  if (auth.isSignedIn()) {
    return true;
  }
  router.navigateByUrl('/sign-in');
  return false;
};


export function roleGuard(roles: UserRole[]): CanActivateFn {
  return function (): boolean {
    var auth = inject(AuthService);
    var router = inject(Router);

    if (!auth.isSignedIn()) {
      router.navigateByUrl('/sign-in');
      return false;
    }
    if (auth.hasAnyRole(roles)) {
      return true;
    }
    router.navigateByUrl(auth.homeRoute());
    return false;
  };
}

export const homeRedirectGuard: CanActivateFn = function (): UrlTree {
  var auth = inject(AuthService);
  var router = inject(Router);
  return router.parseUrl(auth.homeRoute());
};
