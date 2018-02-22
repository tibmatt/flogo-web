import { Component, Input, ViewChild } from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {ERROR_CODE, FlowSummary, LanguageService} from '@flogo/core';
import { AppDetailService } from '@flogo/app/core/apps.service';
import {notification} from '@flogo/shared/utils';

@Component({
  selector: 'flogo-export-flow',
  templateUrl: 'export-flows.component.html',
  styleUrls: ['export-flows.component.less']
})
export class FlogoExportFlowsComponent {
  @ViewChild('modal')
  public modal: ModalComponent;

  @Input()
  flows: Array<FlowSummary> = [];
  checkedFlows = [];
  checkAllFlows = [];

  constructor(private appDetailService: AppDetailService, private translate: LanguageService) {
  }

  public openExport() {
    this.resetForm();
    this.modal.open();
    this.selectAllFlows();
  }

  public selectAllFlows() {
    this.checkedFlows = [];
    this.checkAllFlows = [];
    this.flows.forEach((flow, index) => {
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
    if (this.checkedFlows.length === this.flows.length) {
      flowsToExport = [];
    } else {
      flowsToExport = this.checkedFlows;
    }
      return () => this.appDetailService.exportFlow(flowsToExport)
        .then(appWithFlows => {
          return [{
            fileName: 'flows.json',
            data: appWithFlows
          }];
        }).catch(errRsp => {
          if (errRsp.errors[0].code ===  ERROR_CODE.HAS_SUBFLOW) {
            this.translate.get('DETAILS-EXPORT:CANNOT-EXPORT').toPromise()
              .then(msg => notification(msg, 'error'));
          } else {
            console.error(errRsp.errors);
            this.translate.get('DETAILS-EXPORT:ERROR_UNKNOWN').toPromise()
              .then(msg => notification(msg, 'error'));
          }
        });
    }
  private resetForm() {
    this.unselectAllFlows();
  }

}
