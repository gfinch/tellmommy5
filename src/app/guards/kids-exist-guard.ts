import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {NavController} from '@ionic/angular';
import {KidService} from '../services/kid/kid.service';

@Injectable({
    providedIn: 'root'
})
export class KidsExistGuard implements CanActivate {
    constructor(private navController: NavController,
                private kidService: KidService) {
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (this.kidService.listKids().length <= 0) {
            return this.navController.navigateRoot('/tellmommy/tabs/setup-kids').then(() => {
                return false;
            });
        } else {
            return true;
        }
    }
}
