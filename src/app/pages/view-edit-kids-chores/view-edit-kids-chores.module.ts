import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ViewEditKidsChoresPage } from './view-edit-kids-chores.page';

const routes: Routes = [
  {
    path: '',
    component: ViewEditKidsChoresPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ViewEditKidsChoresPage]
})
export class ViewEditKidsChoresPageModule {}
