import {Component, HostBinding, Inject, InjectionToken} from '@angular/core';
import {
  ConfirmationContent,
  ConfirmationControl,
  ERROR_CODE,
} from '@flogo/core';
import { AppDetailService } from '@flogo/app/core/apps.service';
import { NotificationsService } from '@flogo/core/notifications';
import {animate, style, transition, trigger} from '@angular/animations';
export const EXPORT_FLOW_MODAL_TOKEN = new InjectionToken<any>('flogo/app/app-detail/flogo-export-flow');
@Component({
  selector: 'flogo-export-flow',
  templateUrl: 'export-flows.component.html',
  styleUrls: ['export-flows.component.less'],
  animations: [
    trigger('exportFlowsDialog', [
      transition('void => *', [
        style({ transform: 'translateY(-100%)', opacity: 0 }),
        animate('250ms ease-in')
      ]),
      transition('* => void', [
        animate('250ms ease-in', style({ transform: 'translateY(-100%)', opacity: 0 }))
      ]),
    ])
  ],
})
export class FlogoExportFlowsComponent implements ConfirmationContent {
  @HostBinding('@exportFlowsDialog')
  checkedFlows = [];
  checkAllFlows = [];

  constructor(
    @Inject(EXPORT_FLOW_MODAL_TOKEN) public data: any, public control: ConfirmationControl,
    private appDetailService: AppDetailService,
    private notificationsService: NotificationsService
  ) {
    this.resetForm();
    this.selectAllFlows();
  }


  public selectAllFlows() {
    this.checkedFlows = [];
    this.checkAllFlows = [];
    this.data.flows.forEach((flow, index) => {
      this.checkAllFlows.push(index);
      this.checkedFlows.push(flow.id);
    });
  }
  public unselectAllFlows() {
    this.checkedFlows = [];
    this.checkAllFlows = [];
  }
  public flowSelect(flowId: string, isChecked: boolean, index) {
    if (isChecked) {
      this.checkedFlows.push(flowId);
      this.checkAllFlows.push(index);
    } else {
      const indexOfFlows = this.checkedFlows.indexOf(flowId);
      const indexOfIndices = this.checkAllFlows.indexOf(index);
      this.checkedFlows.splice(indexOfFlows, 1);
      this.checkAllFlows.splice(indexOfIndices, 1);
    }
  }

  public exportFlows() {
    let flowsToExport;
    if (this.checkedFlows.length === this.data.flows.length) {
      flowsToExport = [];
    } else {
      flowsToExport = this.checkedFlows;
    }
    return () => this.appDetailService.exportFlow(flowsToExport, this.data.isLegacyExport)
      .then(appWithFlows => {
        this.control.cancel();
        return [{
          fileName: 'flows.json',
          data: appWithFlows
        }];
      }).catch(errRsp => {
        if (errRsp && errRsp.errors && errRsp.errors[0] && errRsp.errors[0].code === ERROR_CODE.HAS_SUBFLOW) {
          this.notificationsService.error({ key: 'DETAILS-EXPORT:CANNOT-EXPORT' });
        } else {
          console.error(errRsp.errors);
          this.notificationsService.error({ key: 'DETAILS-EXPORT:ERROR_UNKNOWN' });
        }
      });
  }

  private resetForm() {
    this.unselectAllFlows();
  }

}
