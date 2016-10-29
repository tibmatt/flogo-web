import { Component, ViewChild, SimpleChange, OnChanges,EventEmitter } from '@angular/core';
import {MODAL_DIRECTIVES, ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import { TranslatePipe, TranslateService } from 'ng2-translate/ng2-translate';
import { RESTAPIFlowsService } from '../../../common/services/restapi/flows-api.service';

@Component({
    selector: 'flogo-flows-flow-name',
    moduleId: module.id,
    inputs: ['show','repeatedName'],
    outputs: ['correctName','close'],
    templateUrl: 'flow-name.tpl.html',
    styleUrls: ['flow-name.component.css'],
    directives: [MODAL_DIRECTIVES],
    pipes: [TranslatePipe]
})
export class FlogoFlowsFlowName implements OnChanges {
    show:boolean = false;
    repeatedName:string='';
    correctName: EventEmitter<any> = new EventEmitter();
    close: EventEmitter<boolean> = new EventEmitter();
    public flowName: string;
    public flowNameExists = true;
    public nameModified = false;

    constructor(public translate: TranslateService, public APIFlows: RESTAPIFlowsService) {
    }

    @ViewChild('flowNameModal')
        flowNameModal: ModalComponent;

    public sendAddFlowMsg() {
        this.APIFlows.getFlowByName(this.repeatedName)
            .then((res) => {
                this.flowNameExists = true;
                this.nameModified = false;
            })
            .catch((err) => {
                this.correctName.emit(this.repeatedName);
                this.closeModal();
            });



    }
    private closeModal() {
        this.repeatedName = '';
        this.flowNameModal.close();
        this.close.emit(true);
    }

    ngOnChanges( changes : {
        [key : string] : SimpleChange
    } ) {

        if(_.has(changes, 'show')) {
            if(changes['show'].currentValue == true) {
                this.flowNameExists = true;
                this.nameModified = false;
                this.flowNameModal.open()
            }
        }

        if(_.has(changes, 'repeatedName')) {
            if(changes['repeatedName'].currentValue) {
                this.repeatedName = changes['repeatedName'].currentValue;
            }
        }

    }

    public onChangeFlowName(event) {
        this.flowNameExists = false;
        this.nameModified = true;
    }

}
