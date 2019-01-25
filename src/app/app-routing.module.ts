import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from './guards/auth.guard';
import {SetupGuard} from './guards/setup.guard';

const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'register', loadChildren: './pages/register/register.module#RegisterPageModule'},
    {path: 'login', loadChildren: './pages/login/login.module#LoginPageModule'},
    {path: 'forgot-pass', loadChildren: './pages/forgot-pass/forgot-pass.module#ForgotPassPageModule'},
    {
        path: 'home', loadChildren: './pages/home/home.module#HomePageModule',
        canActivate: [AuthGuard, SetupGuard]
    },
    {
        path: 'tellmommy',
        loadChildren: './pages/tabs/tabs.module#TabsModule',
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
