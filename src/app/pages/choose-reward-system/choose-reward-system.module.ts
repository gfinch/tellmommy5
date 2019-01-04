import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ChooseRewardSystemPage } from './choose-reward-system.page';

const routes: Routes = [
  {
    path: '',
    component: ChooseRewardSystemPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ChooseRewardSystemPage]
})
export class ChooseRewardSystemPageModule {}
