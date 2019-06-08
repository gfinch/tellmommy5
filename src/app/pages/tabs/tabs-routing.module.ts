import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TabsPage} from './tabs.page';
import {ChooseRewardSystemPage} from '../choose-reward-system/choose-reward-system.page';
import {SetupKidsPage} from '../setup-kids/setup-kids.page';
import {SetupChoresPage} from '../setup-chores/setup-chores.page';
import {AuthGuard} from '../../guards/auth.guard';
import {KidNotDeletedGuard} from '../../guards/kid-not-deleted-guard';
import {SetupKidEditPage} from '../setup-kid-edit/setup-kid-edit.page';
import {ChooseAvatarPage} from '../choose-avatar/choose-avatar.page';
import {KidsExistGuard} from '../../guards/kids-exist-guard';
import {SetupChoreEditPage} from '../setup-chore-edit/setup-chore-edit.page';


const routes: Routes = [
    {
        path: 'tab',
        component: TabsPage,
        children: [
            {
                path: 'choose-reward-system',
                children: [
                    {
                        path: '',
                        component: ChooseRewardSystemPage,
                        canActivate: [AuthGuard]
                    }
                ]
            },
            {
                path: 'setup-kids',
                children: [
                    {
                        path: '',
                        component: SetupKidsPage,
                        canActivate: [AuthGuard]
                    },
                    {
                        path: 'kids/:id',
                        component: SetupKidEditPage,
                        canActivate: [AuthGuard, KidNotDeletedGuard]
                    },
                    {
                        path: 'kids/:id/avatar',
                        component: ChooseAvatarPage,
                        canActivate: [AuthGuard, KidNotDeletedGuard]
                    }
                ]
            },
            {
                path: 'setup-chores',
                children: [
                    {
                        path: '',
                        component: SetupChoresPage,
                    },
                    {
                        path: 'chores/:id',
                        component: SetupChoreEditPage,
                        canActivate: [AuthGuard, KidsExistGuard]
                    }
                ]
            },
            {
                path: '',
                redirectTo: '/setup/tab/choose-reward-system',
                pathMatch: 'full'
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TabsRoutingModule {
}

