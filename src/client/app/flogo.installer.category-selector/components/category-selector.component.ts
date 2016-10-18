import { Component, EventEmitter, SimpleChange, OnChanges } from '@angular/core';
import { TranslatePipe, TranslateService } from 'ng2-translate/ng2-translate';

@Component( {
  selector : 'flogo-installer-category-selector',
  moduleId : module.id,
  directives : [],
  inputs : [ 'categories: flogoCategories' ],
  outputs : [ 'categorySelected: flogoOnCategorySelected' ],
  templateUrl : 'category-selector.tpl.html',
  styleUrls : [ 'category-selector.component.css' ],
  pipes: [TranslatePipe]
} )
export class FlogoInstallerCategorySelectorComponent implements OnChanges {

  private categorySelected = new EventEmitter();

  constructor(public translate: TranslateService) {
    this.init();
  }

  init() {
    console.log( 'Initialise Flogo Installer Category Selector Component.' );
  }

  ngOnChanges( changes : {
    [key : string] : SimpleChange
  } ) {

    if ( _.has( changes, 'categories' ) ) {
      this.onCategoriesChange( changes[ 'categories' ].currentValue );
    }

  }

  onCategoriesChange( newValue ) {
    console.log( 'onCategoriesChange' );
    console.log( newValue );
  }

  onCategorySelected( categoryName : string ) {
    this.categorySelected.emit( categoryName );
  }
}
