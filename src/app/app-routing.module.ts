import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
    {path: '', redirectTo: 'register', pathMatch: 'full'},
    {path: 'register', loadChildren: './pages/register/register.module#RegisterPageModule'},
    {path: 'login', loadChildren: './pages/login/login.module#LoginPageModule'},
  { path: 'forgot-pass', loadChildren: './pages/forgot-pass/forgot-pass.module#ForgotPassPageModule' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
