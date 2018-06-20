import { Injectable, Injector } from '@angular/core';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { ConfirmationControl } from './confirmation-control';
import { ConfirmationComponent } from './confirmation.component';

@Injectable()
export class ConfirmationService {

  constructor(private injector: Injector, private overlay: Overlay) { }

  open() {
    const overlayRef = this.createOverlay();
    const control = new ConfirmationControl(overlayRef);
    const portal = this.createPortal(control);
    overlayRef.attach(portal);
    overlayRef.backdropClick().subscribe(() => control.cancel());
    return control;
  }

  private createPortal(control: ConfirmationControl) {
    const injector = this.createInjector(control);
    return new ComponentPortal(ConfirmationComponent, null, injector);
  }

  private createInjector(control: ConfirmationControl): PortalInjector {
    const injectionTokens = new WeakMap();
    injectionTokens.set(ConfirmationControl, control);
    return new PortalInjector(this.injector, injectionTokens);
  }

  private createOverlay() {
    const overlayConfig = this.getOverlayConfig();
    return this.overlay.create(overlayConfig);
  }

  private getOverlayConfig(): OverlayConfig {
    return new OverlayConfig({
      hasBackdrop: true,
      // backdropClass: config.backdropClass,
      // panelClass: config.panelClass,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically()
    });
  }

}
