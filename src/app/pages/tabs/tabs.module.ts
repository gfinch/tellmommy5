import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Routes} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {TabsPage} from './tabs.page';
import {ChooseRewardSystemPageModule} from '../choose-reward-system/choose-reward-system.module';
import {TabsRoutingModule} from './tabs-routing.module';
import {SetupKidsPageModule} from '../setup-kids/setup-kids.module';
import {SetupChoresPageModule} from '../setup-chores/setup-chores.module';
import {SetupKidEditPageModule} from '../setup-kid-edit/setup-kid-edit.module';
import {SetupChoreEditPageModule} from '../setup-chore-edit/setup-chore-edit.module';
import {ChooseAvatarPageModule} from '../choose-avatar/choose-avatar.module';

const routes: Routes = [
    {
        path: '',
        component: TabsPage
    }
];

@NgModule({
    imports: [
        ChooseRewardSystemPageModule,
        SetupKidsPageModule,
        SetupChoresPageModule,
        SetupKidEditPageModule,
        SetupChoreEditPageModule,
        ChooseAvatarPageModule,
        CommonModule,
        IonicModule,
        TabsRoutingModule
    ],
    declarations: [TabsPage]
})
export class TabsModule {
}
