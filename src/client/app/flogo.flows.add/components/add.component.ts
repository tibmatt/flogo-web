import { Component, ViewChild } from '@angular/core';
import {PostService} from '../../../common/services/post.service';
import {PUB_EVENTS} from '../message';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { RESTAPIFlowsService } from '../../../common/services/restapi/flows-api.service';
import { notification } from '../../../common/utils';

@Component({
    selector: 'flogo-flows-add',
    moduleId: module.id,
    templateUrl: 'add.tpl.html',
    styleUrls: ['add.component.css']
})
export class FlogoFlowsAdd {
    public flowName: string;
    public flowDescription: string;

    public flowInfo : any = {};
    private _sending = true;
    public flowNameExists = false;

    constructor(private _postService: PostService, public translate: TranslateService, public APIFlows: RESTAPIFlowsService) {
    }

    @ViewChild('modal')
        modal: ModalComponent;

    public sendAddFlowMsg() {
        this.APIFlows.getFlowByName(this.flowInfo.name)
              .then((res) => {
                let results;
                try {
                    results = JSON.parse(res['_body']);
                }catch(err) {
                    results = [];
                }
                console.log('RESULTS', res);

                if(!_.isEmpty(results)) {
                  console.log('EXIST');
                  this.flowNameExists = true;
                } else {
                    console.log('DOES NOT EXIST');
                    this.flowNameExists = false;
                    if (this._sending) {
                        this._sending = false;
                        this._postService.publish(
                            _.assign({}, PUB_EVENTS.addFlow, {data: this.flowInfo})
                        );
                        this.closeAddFlowModal();
                    } else {
                        // omit
                    }
                }
            })
            .catch((err) => {
                let message = this.translate.instant('CANVAS:ERROR-GETTING-FLOW-NAME');
                notification(message, 'error');
            });


    }
    private closeAddFlowModal() {
        this.flowInfo = {};
        this.modal.close();
        this._sending = true;
        this.flowNameExists = false;
    }

    public onChangeFlowName(event) {
        this.flowNameExists = false;
    }
}
