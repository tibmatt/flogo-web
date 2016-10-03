import { Component, EventEmitter, OnChanges, SimpleChange } from '@angular/core';

const PLACEHOLDER = 'SEARCH';

@Component( {
  selector : 'flogo-installer-search',
  moduleId : module.id,
  templateUrl : 'search.tpl.html',
  inputs : [ 'query: flogoSearchQuery' ],
  outputs : [ 'queryUpdate: flogoSearchQueryChange' ],
  styleUrls : [ 'search.component.css' ]
} )
export class FlogoInstallerSearchComponent implements OnChanges {
  private placeholder = PLACEHOLDER;
  private _searchQuery = '';
  private query : string;
  private queryUpdate = new EventEmitter();

  constructor() {
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
