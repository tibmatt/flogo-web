import { OnChanges, SimpleChange } from '@angular/core';

const TO_BE_OVERRIDDEN = '[FlogoInstallerBaseComponent] To be overridden.';

export class FlogoInstallerBaseComponent implements OnChanges {

  private query : string;

  _categories = <string[]>[];
  _installables = <any[]>[];
  installables = <any[]>[];

  constructor() {
    this.init();
  }

  init() {
    console.log( 'Initialise Flogo Installer Base Component.' );
    this._categories = this.getCategories();
    this.installables = this.getInstallables();

    this._installables = this.getFilteredInstallables();
  }

  // TODO replace these mock data.
  getCategories() {
    console.log( TO_BE_OVERRIDDEN );
    return [
      'Requests',
      'Optimizations',
      'Connect to Devices',
      'Framework Adaptors',
      'Web Adaptors',
      'Uncategorized'
    ];
  }

  getInstallables() {
    console.log( TO_BE_OVERRIDDEN );
    return [
      {
        name : '',
        description : '',
        version : '',
        where : '',
        icon : '',
        author : '',
        createTime : Date.now(),
        isInstalled : false
      }
    ];
  }

  getFilteredInstallables() {
    let reg = new RegExp( this.query, 'i' );

    return this.installables.filter( ( installable : any )=> {

      // filer the name that the user can see.
      let displayName = installable.title || installable.name;

      return displayName.search( reg ) != -1 || installable.description.search( reg ) != -1
    } );
  }

  ngOnChanges( changes : {
    [key : string] : SimpleChange
  } ) : any {

    if ( _.has( changes, 'query' ) ) {
      let currentValue = changes[ 'query' ].currentValue;

      this.onQueryChange( this.query );
    }

  }

  onQueryChange( query : string ) {
    this._installables = this.getFilteredInstallables();
  }

  onCategorySelected( categoryName : string ) {
    console.log( TO_BE_OVERRIDDEN );
    console.log( categoryName );
  }

  onItemAction( info : any ) {
    console.log( TO_BE_OVERRIDDEN );
  }
}
