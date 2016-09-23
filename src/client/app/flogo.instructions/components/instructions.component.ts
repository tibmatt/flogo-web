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
    steps:any[] = [
        {title:'Configure the trigger', description: '', icon: '/assets/svg/flogo.icon.step-1', screenshot:'/assets/svg/graphic-1.svg'} ,
        {title:'Add and configure activities', description: '', icon: '/assets/svg/flogo.icon.step-2', screenshot:'/assets/svg/graphic-2.svg'} ,
        {title:'Run and test at any time', description: '', icon: '/assets/svg/flogo.icon.step-3', screenshot:'/assets/svg/graphic-3.svg'} ,
        {title:'Build and run', description: '', icon: '/assets/svg/flogo.icon.step-4', screenshot:'/assets/svg/graphic-4.svg'}
    ];
    currentIndex : number;
    currentStep :any[];
    STEPS_LENGTH = this.steps.length - 1;

    constructor( ) {
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
        if(this.currentIndex < this.STEPS_LENGTH ) {
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
            if(changes['isActivated'].currentValue == true) {
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