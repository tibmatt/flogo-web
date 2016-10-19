import { Component, EventEmitter, OnChanges, SimpleChange } from '@angular/core';
import { TranslatePipe, TranslateService } from 'ng2-translate/ng2-translate';
import { RESTAPISamplesService } from '../../../common/services/restapi/samples-api.service';

@Component( {
  selector : 'flogo-samples-installer',
  moduleId : module.id,
  directives : [],
  templateUrl : 'samples-installer.tpl.html',
  inputs : [ 'samples' ],
  styleUrls : [ 'samples-installer.component.css' ],
  pipes: [TranslatePipe],
  providers:[RESTAPISamplesService]
} )
export class FlogoSamplesInstallerComponent implements OnChanges {
  public placeholder = '';
  private samples : any = [];
  public currentProgress : string = '0%';
  public currentSample = {name:''};

  constructor(translate: TranslateService, public _APISamples: RESTAPISamplesService) {
    this.init();
  }

  init() {
    // TODO
  }

  installSamples(samples) {
    let progress = 0;

    if(typeof samples !== 'undefined') {

      this.samples.forEach((sample) => {
        this.currentSample = sample;
        this._APISamples.getSample(sample.url)
            .then((res:any)=> {
              progress += 10;
              this.currentProgress = `${progress}%`
            })
      });
    }

  }


  /*
  onSearchQueryChange( newQuery : string ) {
    this._searchQuery = newQuery;
    this.queryUpdate.emit( this._searchQuery );
  }
  */

  ngOnChanges( changes : {
    [key : string] : SimpleChange
  } ) {

    if ( _.has( changes, 'samples' ) ) {
      let currentValue = changes[ 'samples' ].currentValue;
      console.log('The current samples is:');
      this.installSamples(currentValue);
    }

  }
}
