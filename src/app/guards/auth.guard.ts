import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from '../services/auth/auth.service';
import {NavigationService, Page} from '../services/navigation/navigation.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private navigationService: NavigationService, private authService: AuthService) {
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return new Promise<boolean>((resolve, reject) => {
            this.authService.isSignedIn().then(answer => {
                if (!answer) {
                    this.navigationService.navigateRoot(Page.Register).then(() => {
                        resolve(false);
                    });
                } else {
                    resolve(true);
                }
            }).catch(err => reject(err));
        });
    }
}
