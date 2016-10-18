import { Component, EventEmitter, OnChanges, SimpleChange } from '@angular/core';
import { TranslatePipe, TranslateService } from 'ng2-translate/ng2-translate';


@Component( {
  selector : 'flogo-installer-search',
  moduleId : module.id,
  directives : [],
  templateUrl : 'search.tpl.html',
  inputs : [ 'query: flogoSearchQuery' ],
  outputs : [ 'queryUpdate: flogoSearchQueryChange' ],
  styleUrls : [ 'search.component.css' ],
  pipes: [TranslatePipe]
} )
export class FlogoInstallerSearchComponent implements OnChanges {
  public placeholder = '';
  private _searchQuery = '';
  private query : string;
  private queryUpdate = new EventEmitter();

  constructor(translate: TranslateService) {
    this.placeholder = translate.get('SEARCH:SEARCH')['value'];
    this.init();
  }

  init() {
    // TODO
  }

  onSearchQueryChange( newQuery : string ) {
    this._searchQuery = newQuery;
    this.queryUpdate.emit( this._searchQuery );
  }

  ngOnChanges( changes : {
    [key : string] : SimpleChange
  } ) {

    if ( _.has( changes, 'query' ) ) {
      let currentValue = changes[ 'query' ].currentValue;

      if ( currentValue !== this._searchQuery ) {
        this._searchQuery = currentValue;
      }
    }

  }
}
