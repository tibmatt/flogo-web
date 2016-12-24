import { Component, OnChanges, AfterViewInit, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { CanActivate,  RouteParams } from '@angular/router-deprecated';
import { isConfigurationLoaded } from '../../../common/services/configurationLoaded.service';
import { TranslatePipe, TranslateService } from 'ng2-translate/ng2-translate';
import { IFlogoApplicationModel } from '../../../common/application.model';
import { timeString } from '../../../common/utils';
import { RESTAPIApplicationsService } from '../../../common/services/restapi/applications-api.service';
import { FlogoApplicationFlowsComponent } from '../../flogo.app.flows/components/flows.component';

import {
    notification,
} from '../../../common/utils';



@Component( {
    selector: 'flogo-app-details',
    moduleId: module.id,
    templateUrl: 'details.tpl.html',
    styleUrls: [ 'details.component.css' ],
    directives: [FlogoApplicationFlowsComponent],
    pipes: [TranslatePipe]
} )
@CanActivate((next) => {
    return isConfigurationLoaded();
})
export class FlogoApplicationDetailsComponent implements AfterViewInit, OnInit  {
    @ViewChild('appInputName') appInputName: ElementRef;
    @ViewChild('appInputDescription') appInputDescription: ElementRef;
    application: IFlogoApplicationModel = null;
    createdAtFormatted: any;
    editingDescription: boolean = false;
    editingName: boolean = false;

    constructor(
        private _routeParams: RouteParams,
        public translate: TranslateService,
        private renderer: Renderer,
        private apiApplications: RESTAPIApplicationsService
    ) {
        // get application details by id
        this.apiApplications.get(this._routeParams.params['id'])
            .then((application:IFlogoApplicationModel)=> {
                this.application = application;
                this.application.flows = this.application.flows || [];
            });
    }

    ngOnInit() {
        let timeStr = timeString(this.application.createdAt);
        this.createdAtFormatted = moment(timeStr, 'YYYYMMDD hh:mm:ss').fromNow();

        if(this.application.updatedAt == null) {
            this.editingName = true;
        }else {
            this.editingName = false;
        }
    }


    ngAfterViewInit() {
        if(this.application.updatedAt == null) {
            this.renderer.invokeElementMethod(this.appInputName.nativeElement, 'focus',[]);
        }
    }

    onClickAddDescription(event) {
        this.editingDescription = true;
        // wait to refresh view
        setTimeout(()=> {
            this.renderer.invokeElementMethod(this.appInputDescription.nativeElement, 'focus',[]);
        }, 0);
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
        setTimeout(()=> {
            this.renderer.invokeElementMethod(this.appInputName.nativeElement, 'focus',[]);
        },0);
    }

    onClickLabelDescription(event) {
        this.editingDescription = true;
        setTimeout(()=> {
            this.renderer.invokeElementMethod(this.appInputDescription.nativeElement, 'focus',[]);
        },0);
    }

    onKeyUpName(event) {
        if(event.code == "Enter") {
            this.editingName = false;
        }
    }

    onKeyUpDescription(event) {
        if(event.code == "Enter") {
            this.editingDescription = false;
        }
    }

}
