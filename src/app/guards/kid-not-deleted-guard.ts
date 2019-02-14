import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {KidService} from '../services/kid/kid.service';
import {NavigationService, Page} from '../services/navigation/navigation.service';

@Injectable({
    providedIn: 'root'
})
export class KidNotDeletedGuard implements CanActivate {
    constructor(private navigationService: NavigationService,
                private kidService: KidService) {
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        const kidId = next.paramMap.get('id');
        if (this.kidService.getKid(kidId) && !this.kidService.getKid(kidId).deleted) {
            return true;
        } else {
            return this.navigationService.navigateRoot(Page.SetupKids).then(() => {
                return false;
            });
        }
    }
}
