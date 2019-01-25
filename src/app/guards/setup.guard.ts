import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {NavController} from '@ionic/angular';
import {ChoreService} from '../services/chore/chore.service';
import {KidService} from '../services/kid/kid.service';

@Injectable({
    providedIn: 'root'
})
export class SetupGuard implements CanActivate {
    constructor(private navController: NavController,
                private kidService: KidService,
                private choreService: ChoreService) {
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (this.kidService.listKids().length > 0 && this.choreService.assignments.size > 0) {
            return true;
        } else if (this.kidService.listKids().length > 0) {
            return this.navController.navigateRoot('/tellmommy/tabs/setup-chores').then(() => {
                return false;
            });
        } else {
            return this.navController.navigateRoot('/tellmommy/tabs/choose-reward-system').then(() => {
                return false;
            });
        }
    }
}
