import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {AmplifyService, AmplifyServiceAWS} from './services/amplify/amplify.service';
import {StorageService, StorageServiceIonic} from './services/storage/storage.service';
import {EventsService, EventsServiceIonic} from './services/events/events.service';
import {IonicStorageModule} from '@ionic/storage';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, IonicStorageModule.forRoot(), HttpClientModule],
    providers: [
        StatusBar,
        SplashScreen,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        {provide: AmplifyService, useClass: AmplifyServiceAWS},
        {provide: StorageService, useClass: StorageServiceIonic},
        {provide: EventsService, useClass: EventsServiceIonic},
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
