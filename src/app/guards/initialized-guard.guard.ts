import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {KidService} from '../services/kid/kid.service';
import {AccountService} from '../services/account/account.service';
import {BankService} from '../services/bank/bank.service';
import {ChoreService} from '../services/chore/chore.service';
import {ChoreChartService} from '../services/chore-chart/chore-chart.service';
import {RewardSystemService} from '../services/reward-system/reward-system.service';
import {NavigationService} from '../services/navigation/navigation.service';

@Injectable({
    providedIn: 'root'
})
export class InitializedGuardGuard implements CanActivate {
    constructor(private navigationService: NavigationService,
                private accountService: AccountService,
                private bankService: BankService,
                private choreService: ChoreService,
                private choreChartService: ChoreChartService,
                private rewardSystemService: RewardSystemService,
                private kidService: KidService) {
    }

    canActivate(next: ActivatedRouteSnapshot,
                state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (this.accountService.initialized && this.bankService.initialized &&
            this.choreService.initialized && this.choreChartService.initialized &&
            this.rewardSystemService.initialized && this.kidService.initialized) {
            return true;
        } else {
            return false;
        }
    }
}
