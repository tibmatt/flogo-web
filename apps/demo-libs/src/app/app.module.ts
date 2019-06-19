import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { OverlayModule } from '@angular/cdk/overlay';

import { CoreModule } from '@flogo-web/lib-client/core';
import { NotificationsModule } from '@flogo-web/lib-client/notifications';
import { ModalModule } from '@flogo-web/lib-client/modal';
import { ContextPanelModule } from '@flogo-web/lib-client/context-panel';

import { AppComponent, HomeComponent } from './app.component';
import { NotificationsComponent } from './notifications';
import { ModalParentComponent, ModalDemoModule } from './modal';
import { ContextPanelComponent } from './context-panel/context-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NotificationsComponent,
    ContextPanelComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    OverlayModule,

    CoreModule,
    NotificationsModule,
    ModalModule,
    ContextPanelModule,

    RouterModule.forRoot(
      [
        { path: 'notifications', component: NotificationsComponent },
        { path: 'modals', component: ModalParentComponent },
        { path: 'context-panel', component: ContextPanelComponent },
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
