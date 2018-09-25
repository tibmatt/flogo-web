import {Component, HostBinding, Inject, InjectionToken} from '@angular/core';
import {Action, ERROR_CODE} from '@flogo/core';
import {AppDetailService} from '@flogo/app/core/apps.service';
import {NotificationsService} from '@flogo/core/notifications';
import {ModalControl} from '@flogo/core/modal/modal-control';
import {MODAL_TOKEN, ModalContent} from '@flogo/core/modal/modal.service';
import {modalAnimate} from '@flogo/core/modal/modal-animation';

export interface ExportFlowsData {
  flows: Array<Action>;
  isLegacyExport: boolean;
}

@Component({
  selector: 'flogo-export-flow',
  templateUrl: 'export-flows.component.html',
  styleUrls: ['export-flows.component.less'],
  animations: [modalAnimate],
})
export class FlogoExportFlowsComponent implements ModalContent {
  @HostBinding('@modalAnimate')
  checkedFlows = [];
  checkAllFlows = [];

  constructor(
    @Inject(MODAL_TOKEN) public exportFlowsData: ExportFlowsData, public control: ModalControl,
    private appDetailService: AppDetailService,
    private notificationsService: NotificationsService
  ) {
    this.resetForm();
    this.selectAllFlows();
  }


  public selectAllFlows() {
    this.checkedFlows = [];
    this.checkAllFlows = [];
    this.exportFlowsData.flows.forEach((flow, index) => {
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
    if (this.checkedFlows.length === this.exportFlowsData.flows.length) {
      flowsToExport = [];
    } else {
      flowsToExport = this.checkedFlows;
    }
    return () => this.appDetailService.exportFlow(flowsToExport, this.exportFlowsData.isLegacyExport)
      .then(appWithFlows => {
        this.control.close('Flows Exported');
        return [{
          fileName: 'flows.json',
          data: appWithFlows
        }];
      }).catch(errRsp => {
        if (errRsp && errRsp.errors && errRsp.errors[0] && errRsp.errors[0].code === ERROR_CODE.HAS_SUBFLOW) {
          this.notificationsService.error({key: 'DETAILS-EXPORT:CANNOT-EXPORT'});
        } else {
          console.error(errRsp.errors);
          this.notificationsService.error({key: 'DETAILS-EXPORT:ERROR_UNKNOWN'});
        }
      });
  }

  private resetForm() {
    this.unselectAllFlows();
  }

}
