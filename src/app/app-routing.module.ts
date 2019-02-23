import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from './guards/auth.guard';
import {SetupGuard} from './guards/setup.guard';

const routes: Routes = [
    {path: '', redirectTo: 'choose-a-kid', pathMatch: 'full'},
    {path: 'register', loadChildren: './pages/register/register.module#RegisterPageModule'},
    {path: 'login', loadChildren: './pages/login/login.module#LoginPageModule'},
    {path: 'forgot-pass', loadChildren: './pages/forgot-pass/forgot-pass.module#ForgotPassPageModule'},
    {
        path: 'home',
        redirectTo: 'choose-a-kid'
    },
    {
        path: 'setup',
        loadChildren: './pages/tabs/tabs.module#TabsModule',
        canActivate: [AuthGuard]
    },
    {
        path: 'choose-a-kid',
        loadChildren: './pages/choose-a-kid/choose-a-kid.module#ChooseAKidPageModule',
        canActivate: [AuthGuard, SetupGuard]
    },
    {
        path: 'view-edit-kids-chores/:id',
        loadChildren: './pages/view-edit-kids-chores/view-edit-kids-chores.module#ViewEditKidsChoresPageModule',
        canActivate: [AuthGuard, SetupGuard]
    },
    {
        path: 'view-edit-kids-account/:kidId/:accountId',
        loadChildren: './pages/view-edit-kids-account/view-edit-kids-account.module#ViewEditKidsAccountPageModule',
        canActivate: [AuthGuard, SetupGuard]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
