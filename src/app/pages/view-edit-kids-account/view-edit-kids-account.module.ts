import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ViewEditKidsAccountPage } from './view-edit-kids-account.page';

const routes: Routes = [
  {
    path: '',
    component: ViewEditKidsAccountPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ViewEditKidsAccountPage]
})
export class ViewEditKidsAccountPageModule {}
