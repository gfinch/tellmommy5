import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {NavController} from '@ionic/angular';
import {KidService} from '../services/kid/kid.service';

@Injectable({
    providedIn: 'root'
})
export class KidNotDeletedGuard implements CanActivate {
    constructor(private navController: NavController,
                private kidService: KidService) {
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        const kidId = next.paramMap.get('id');
        if (this.kidService.getKid(kidId) && !this.kidService.getKid(kidId).deleted) {
            return true;
        } else {
            return this.navController.navigateRoot('/tellmommy/tabs/setup-kids').then(() => {
                return false;
            });
        }
    }
}
