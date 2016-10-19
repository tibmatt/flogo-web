import { Component, EventEmitter, OnChanges, SimpleChange } from '@angular/core';
import { TranslatePipe, TranslateService } from 'ng2-translate/ng2-translate';
import { RESTAPISamplesService } from '../../../common/services/restapi/samples-api.service';
import { RESTAPIFlowsService } from '../../../common/services/restapi/flows-api.service';

@Component( {
  selector : 'flogo-samples-installer',
  moduleId : module.id,
  directives : [],
  templateUrl : 'samples-installer.tpl.html',
  inputs : [ 'samples' ],
  outputs: ['installationIsDone']  ,
  styleUrls : [ 'samples-installer.component.css' ],
  pipes: [TranslatePipe],
  providers:[RESTAPISamplesService,RESTAPIFlowsService]
} )
export class FlogoSamplesInstallerComponent implements OnChanges {
  public placeholder = '';
  private samples : any = [];
  public currentProgress : number = 10;
  public currentPercentage: string = '';
  public currentSample:any = null;
  public isDone:  boolean = false;
  public installationIsDone = new EventEmitter();

  constructor(translate: TranslateService,
             public _APISamples: RESTAPISamplesService,
             public _APIFlows: RESTAPIFlowsService) {
    this.init();
  }

  init() {
    // TODO
  }

  installSamples(samples) {
    let counter = 1;

    if(typeof samples !== 'undefined') {

      this.samples.forEach((sample) => {
        this._APISamples.getSample(sample.url)
            .then((flow:any)=> {

              ((counter, pro) => {
                   setTimeout(() => {

                    this._APIFlows.uploadFlowToImport(flow)
                        .then((res)=> {
                          this.currentPercentage = `${pro}%`;
                          this.currentSample = sample;
                        }).
                        catch((err)=> {
                        console.log(err);
                        });

                    if(pro >= 100)    {
                        setTimeout(()=> {
                            this.isDone = true;
                            this.installationIsDone.emit();
                        },2000);
                    }


                  }, counter * 500)

               }) (counter, this.currentProgress);

                this.currentProgress += 10;
                counter +=1;

            });
      });
    }

  }

  ngOnChanges( changes : {
    [key : string] : SimpleChange
  } ) {

    if ( _.has( changes, 'samples' ) ) {
      let currentValue = changes[ 'samples' ].currentValue;
      this.installSamples(currentValue);
    }

  }
}
