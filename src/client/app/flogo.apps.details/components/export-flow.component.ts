import { Component, Input, SimpleChanges, OnChanges, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { IFlogoApplicationModel, IFlogoApplicationFlowModel, Trigger } from '../../../common/application.model';
import { TranslateService } from 'ng2-translate/ng2-translate';
import {
  AppDetailService,
  ApplicationDetail,
  ApplicationDetailState,
  FlowGroup,
  App
} from '../../flogo.apps/services/apps.service';
import { PostService } from '../../../common/services/post.service';
import { SanitizeService } from '../../../common/services/sanitize.service';
import { APIFlowsService } from '../../../common/services/restapi/v2/flows-api.service';



@Component({
  selector: 'flogo-export-flow',
  // moduleId: module.id,
  templateUrl: 'export-flow.tpl.html',
  styleUrls: ['export-flow.component.less']
})
export class FlogoExportFlowsComponent implements OnChanges {
  @ViewChild('modal')
  public modal: ModalComponent;

@Input()
flows: Array<IFlogoApplicationFlowModel> = [];

  constructor(public translate: TranslateService,
              private postService: PostService,
              private appDetailService: AppDetailService,
              private formBuilder: FormBuilder,
              private sanitizer: SanitizeService
  ) {

  }
  checkedFlows = [];
  checkAllFlows = [];
  public ngOnChanges(changes: SimpleChanges) {


  }

  public openExport() {
    this.modal.open();
    console.log(this.flows);
  }

  selectAllFlows(event){
    this.checkedFlows=[];
    this.checkAllFlows=[];
    this.flows.forEach((flow,index) => {
      this.checkAllFlows.push(index);
      this.checkedFlows.push(flow.id);
    })
  }
  unselectAllFlows(){
    this.checkedFlows=[];
    this.checkAllFlows=[];
  }
  flowSelect(flowId:string, isChecked: boolean) {
    if(isChecked) {
      this.checkedFlows.push(flowId);
    } else {
      let index = this.checkedFlows.findIndex(x => x == flowId);
      this.checkedFlows.splice(index, 1);
    }

  }
  exportFlows(){
    let flowsToExport;
    if (this.checkedFlows.length=== this.flows.length){
      flowsToExport ="All";
    }else{
      flowsToExport = this.checkedFlows.toString();
    }
      return () => this.appDetailService.exportFlow(flowsToExport)
        .then(appWithFlows => {
          console.log(appWithFlows);
          return [{
            fileName: 'app.json',
            data: appWithFlows
          }];
        });
    }

}
