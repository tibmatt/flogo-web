import { Injectable, Injector } from '@angular/core';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { TriggerStatus } from '../interfaces';
import { ConfirmationControl } from './confirmation-control';
import { ConfirmationComponent } from './confirmation.component';
import { TRIGGER_STATUS_TOKEN } from './status.token';

@Injectable()
export class ConfirmationService {

  constructor(private injector: Injector, private overlay: Overlay) { }

  open(triggerStatus: TriggerStatus) {
    const overlayRef = this.createOverlay();
    const control = new ConfirmationControl(overlayRef);
    const portal = this.createPortal(triggerStatus, control);
    overlayRef.attach(portal);
    overlayRef.backdropClick().subscribe(() => control.cancel());
    return control;
  }

  private createPortal(triggerStatus: TriggerStatus, control: ConfirmationControl) {
    const injector = this.createInjector(triggerStatus, control);
    return new ComponentPortal(ConfirmationComponent, null, injector);
  }

  private createInjector(triggerStatus: TriggerStatus, control: ConfirmationControl): PortalInjector {
    const injectionTokens = new WeakMap();
    injectionTokens.set(ConfirmationControl, control);
    injectionTokens.set(TRIGGER_STATUS_TOKEN, triggerStatus);
    return new PortalInjector(this.injector, injectionTokens);
  }

  private createOverlay() {
    const overlayConfig = this.getOverlayConfig();
    return this.overlay.create(overlayConfig);
  }

  private getOverlayConfig(): OverlayConfig {
    return new OverlayConfig({
      hasBackdrop: true,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically()
    });
  }

}
