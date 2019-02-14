import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {ChoreService} from '../services/chore/chore.service';
import {KidService} from '../services/kid/kid.service';
import {NavigationService, Page} from '../services/navigation/navigation.service';

@Injectable({
    providedIn: 'root'
})
export class SetupGuard implements CanActivate {
    constructor(private navigationService: NavigationService,
                private kidService: KidService,
                private choreService: ChoreService) {
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (this.kidService.listKids().length > 0 && this.choreService.assignments.size > 0) {
            return true;
        } else if (this.kidService.listKids().length > 0) {
            return this.navigationService.navigateRoot(Page.SetupChores).then(() => {
                return false;
            });
        } else {
            return this.navigationService.navigateRoot(Page.SetupRewardSystem).then(() => {
                return false;
            });
        }
    }
}
