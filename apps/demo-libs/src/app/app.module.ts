import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { OverlayModule } from '@angular/cdk/overlay';

import { NotificationsModule } from '@flogo-web/lib-client/notifications';
import { ModalModule } from '@flogo-web/lib-client/modal';

import { AppComponent, HomeComponent } from './app.component';
import { NotificationsComponent } from './notifications';
import { ModalParentComponent, ModalDemoModule } from './modal';

@NgModule({
  declarations: [AppComponent, HomeComponent, NotificationsComponent],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    OverlayModule,

    NotificationsModule,
    ModalModule,

    RouterModule.forRoot(
      [
        { path: 'notifications', component: NotificationsComponent },
        { path: 'modals', component: ModalParentComponent },
        { path: '', component: HomeComponent },
        { path: '**', redirectTo: '' },
      ],
      {
        initialNavigation: 'enabled',
      }
    ),

    // app modules
    ModalDemoModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
