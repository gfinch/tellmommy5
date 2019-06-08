import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {KidSummaryComponent} from './kid-summary/kid-summary.component';

@NgModule({
    imports: [
        CommonModule,
        IonicModule.forRoot(),
    ],
    declarations: [
        KidSummaryComponent
    ],
    exports: [
        KidSummaryComponent
    ],
    entryComponents: [],
})
export class ComponentsModule {
}
