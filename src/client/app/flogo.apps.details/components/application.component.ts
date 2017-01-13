import { Component, Output, Input, SimpleChange, OnChanges , ViewChild, ElementRef, Renderer, EventEmitter } from '@angular/core';
import { ActivatedRoute, Params as RouteParams } from '@angular/router';
import { IFlogoApplicationModel, IFlogoApplicationFlowModel } from '../../../common/application.model';
import { timeString } from '../../../common/utils';
import { RESTAPIApplicationsService } from '../../../common/services/restapi/applications-api.service';
import { TranslateService } from 'ng2-translate/ng2-translate';

@Component({
    selector: 'flogo-app-details-item',
    moduleId: module.id,
    templateUrl: 'application.tpl.html',
    styleUrls: [ 'application.component.css' ]
})
export class FlogoApplicationComponent implements OnChanges {
    @ViewChild('appInputName') appInputName: ElementRef;
    @ViewChild('appInputDescription') appInputDescription: ElementRef;
    @Output() onParamChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Input() application: IFlogoApplicationModel;
    searchPlaceHolder:string = '';
    createdAtFormatted: any;
    updateAtFormatted: any;
    editingDescription: boolean = false;
    editingName: boolean = false;
    flows: Array<IFlogoApplicationFlowModel> = [];
    subscription: any;


    constructor(
        public translate: TranslateService,
        private renderer: Renderer,
    ) {
        this.searchPlaceHolder = this.translate.instant('DETAILS:SEARCH');
    }

    ngOnChanges(
        changes : {
            [ propKey : string ] : SimpleChange
        }
    ) {
        if(changes['application'].currentValue) {
            this.updateChanges();
        }
    }

    updateChanges() {
        this.flows = this.getOriginalFlows();

        let timeStr = this.application.createdAt;
        this.createdAtFormatted = moment(timeStr, 'YYYYMMDD hh:mm:ss').fromNow();


        if (this.application.updatedAt == null) {
            this.editingName = true;
            this.updateAtFormatted = null;
        } else {
            this.editingName = false;
            this.updateAtFormatted = moment(this.application.updatedAt, 'YYYYMMDD hh:mm:ss').fromNow();
        }
    }


  ngOnInit() {
  }

  getOriginalFlows() {
     return _.clone(this.application.flows || []);
  }


  onClickAddDescription(event) {
        this.editingDescription = true;
  }

  onInputDescriptionBlur(event) {
    this.editingDescription = false;
  }

  onInputNameChange(event) {
     this.application.updatedAt = new Date();
  }

  onInputNameBlur(event) {
     if(this.application.name) {
        this.editingName = false;
     }
  }

  onClickLabelName(event) {
     this.editingName = true;
  }

    onClickLabelDescription(event) {
        this.editingDescription = true;
    }

    onKeyUpName(event) {
        if(event.code == "Enter") {
            this.editingName = false;
        }
    }

    onKeyUpDescription(event) {
    }

    onChangedSearch(search) {
        let flows = this.application.flows || [];

        if(search && flows.length){
            let filtered =  flows.filter((flow:IFlogoApplicationFlowModel)=> {
                return (flow.name || '').toLowerCase().includes(search.toLowerCase()) ||
                       (flow.description || '').toLowerCase().includes(search.toLowerCase())
            });

            this.flows = filtered || [];

        }else {
            this.flows = this.getOriginalFlows();
        }
    }

}
