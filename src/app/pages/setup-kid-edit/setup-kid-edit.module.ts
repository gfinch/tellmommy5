import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SetupKidEditPage } from './setup-kid-edit.page';

const routes: Routes = [
  {
    path: '',
    component: SetupKidEditPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SetupKidEditPage]
})
export class SetupKidEditPageModule {}
