import { Component, EventEmitter, OnChanges, SimpleChange, ViewChild } from '@angular/core';
import { Router } from '@angular/router-deprecated';
import { MODAL_DIRECTIVES, ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { notification } from '../../../common/utils';


@Component( {
    selector : 'flogo-instructions',
    moduleId : module.id,
    directives : [
        MODAL_DIRECTIVES
    ],
    templateUrl : 'instructions.tpl.html',
    inputs : ['isActivated'],
    outputs : ['onClosedModal: flogoOnClosedModal'],
    styleUrls : [ 'instructions.component.css' ]
} )
export class FlogoInstructionsComponent implements OnChanges {

    @ViewChild( 'instructionsModal' ) modal : ModalComponent;

    installType : string;
    isActivated : boolean;
    onInstalled = new EventEmitter();
    onClosedModal = new EventEmitter();
    steps = [
        {title:'Configure the trigger', description: 'Text of configure the trigger...', icon: 'instructions-step-1', screenshot:'instructions-screenshot-pending.png'} ,
        {title:'Add and configure activities', description: 'Text of Add nd configure...', icon: 'instructions-step-2', screenshot:'instructions-screenshot-pending.png'} ,
        {title:'Run and test at any time', description: 'Text of Run and test...', icon: 'instructions-step-3', screenshot:'instructions-screenshot-pending.png'} ,
        {title:'Build and run', description: 'Text of Build and run....', icon: 'instructions-step-4', screenshot:'instructions-screenshot-pending.png'}
    ];
    currentIndex : number;
    currentStep :any[];

    constructor( private _router : Router) {
        this.init();
    }

    init() {
        this.currentIndex = 0;
        this.currentStep = this.steps[this.currentIndex] ;
    }

    clickOption(step:any, index:number) {
        this.currentStep = step;
        this.currentIndex = index;
    }

    clickNext(event) {
        if(this.currentIndex < 3 ) {
            this.currentIndex += 1;
        }
        this.currentStep = this.steps[this.currentIndex];
    }

    clickBack(event) {
        if(this.currentIndex > 0 ) {
            this.currentIndex -= 1;
        }
        this.currentStep = this.steps[this.currentIndex];
    }



    ngOnChanges( changes : {
        [key : string] : SimpleChange
    } ) {

        if(_.has(changes, 'isActivated')) {
            if(changes.isActivated.currentValue == true) {
                this.openModal();
            }
        }
    }

    openModal() {
        console.log( 'Open Modal.' );
        this.init();
        this.modal.open('lg');
    }

    closeModal() {
        this.modal.close();
        this.onClosedModal.emit(true);
    }

    onModalCloseOrDismiss(event) {
        this.onClosedModal.emit(true);
    }

    onInstallAction( url : string ) {
    }
}