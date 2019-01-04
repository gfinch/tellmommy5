import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {NavController} from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class SetupGuard implements CanActivate {
    constructor(private navController: NavController) {
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        // TODO - implement logic to check if already set up.
        return this.navController.navigateRoot('/choose-reward-system').then(() => {
            return false;
        });
    }
}
