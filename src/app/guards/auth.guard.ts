import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {NavController} from '@ionic/angular';
import {AuthService} from '../services/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private navController: NavController, private authService: AuthService) {
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return new Promise<boolean>((resolve, reject) => {
            this.authService.isSignedIn().then(answer => {
                if (!answer) {
                    this.navController.navigateRoot('/register').then(() => {
                        resolve(false);
                    });
                } else {
                    resolve(true);
                }
            }).catch(err => reject(err));
        });
    }
}
