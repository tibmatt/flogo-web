import { Component, Input, AfterViewInit, OnInit } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { IFlogoApplicationFlowModel } from '../../../common/application.model';


@Component( {
    selector: 'flogo-app-flows',
    moduleId: module.id,
    templateUrl: 'flows.tpl.html',
    styleUrls: [ 'flows.component.css' ]
} )
export class FlogoApplicationFlowsComponent implements AfterViewInit, OnInit  {
    @Input() flows: Array<IFlogoApplicationFlowModel> = [];

    constructor(
        public translate: TranslateService
    ) {
    }

    ngOnInit() {
    }


    ngAfterViewInit() {
    }

    formatDate(date) {
        return moment(date).format('MM-DD-YYYY');
    }
''
}
