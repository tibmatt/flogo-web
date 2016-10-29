import { Component, ElementRef, EventEmitter } from '@angular/core';
import { RESTAPIFlowsService } from '../../../common/services/restapi/flows-api.service';
import { notification } from '../../../common/utils';
import { TranslatePipe } from 'ng2-translate/ng2-translate';
import {FlogoFlowsFlowName} from '../../flogo.flows.flow-name/components/flow-name.component';

@Component( {
  selector : 'flogo-flows-import',
  moduleId : module.id,
  templateUrl : 'import-flow.tpl.html',
  styleUrls : [ 'import-flow.component.css' ],
  pipes: [TranslatePipe],
  directives:[FlogoFlowsFlowName],
  outputs : [ 'onError:importError', 'onSuccess:importSuccess' ]
} )
export class FlogoFlowsImport {
  private _elmRef : ElementRef;
  private onError : EventEmitter<any>;
  private onSuccess : EventEmitter<any>;
  public showFileNameDialog:boolean = false;
  public repeatedName:string = '';
  public importFile:any;

  constructor( elementRef : ElementRef, private _flowsAPIs : RESTAPIFlowsService ) {
    this._elmRef = elementRef;
    this.onError = new EventEmitter<any>();
    this.onSuccess = new EventEmitter<any>();
  }

  private selectFile( evt : any ) {
    let fileElm = jQuery( this._elmRef.nativeElement )
      .find( '.flogo-flows-import-input-file' );

    // clean the previous selected file
    try {
      fileElm.val( '' );
    } catch ( err ) {
      console.error( err );
    }

    // trigger the file input.
    // fileElm.click();
  }

  getErrorMessageActivitiesNotInstalled(errors) {
    let errorMessage = '';
    let details = errors.details;
    let errorTriggers = '';
    let errorActivities = '';

    if(details.triggers.length) {
      errorTriggers = ` Missing trigger: "${details.triggers[0]}".`;
    }

    if(details.activities.length) {
      let activities = details.activities.map((item) => {
        return `"${item}"`
      })

      errorActivities += `Missing Activities: ${activities.join(', ')}`;
    }
    errorMessage = `Flow could not be imported, some triggers/activities are not installed.${errorTriggers} ${errorActivities}`;

    return errorMessage;
  }

  onCorrectName(name:string) {
    this.resetValidationFlags();
    this.uploadFlow(this.importFile, name);
  }
  onClose(closed:boolean) {
    this.resetValidationFlags();
  }
  resetValidationFlags() {
    this.showFileNameDialog = false;
    this.repeatedName = '';
  }
  uploadFlow(flow,flowName) {
    let promise = this._flowsAPIs.importFlow(flow,flowName);

     promise.then( ( result : any )=> {
          this.onSuccess.emit( result );
        } )
        .catch( ( err : any )=> {
          let objError;
          try {
            objError = JSON.parse(err.response);
          }catch(exc) {
            objError = {};
          }

          if(err.status == 409) {
            this.showFileNameDialog = true;
          }
          else {
           if(err.status == 406) {
              let errorMessage = this.getErrorMessageActivitiesNotInstalled(objError);
              this.onError.emit( {response: errorMessage} );
           } else {
              this.onError.emit( err );
            }
          }


        } );
}

  private onFileChange( evt : any ) {
    this.importFile = <File> _.get( evt, 'target.files[0]' );

    if ( _.isUndefined( this.importFile ) ) {
      console.error( 'Invalid file to import' );
    } else {
      var reader = new FileReader();
      reader.onload  = ((theFile)=> {
        return (e)=> {
          try {
            let flow = JSON.parse(e.target.result);
            this.repeatedName = flow.name;
          }catch(err) {
          }

          this.uploadFlow(this.importFile, null);
        }
      })(this.importFile);

      reader.readAsText(this.importFile);
    }
  }
}
