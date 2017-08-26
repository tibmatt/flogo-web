import { Component, Input, OnChanges, OnInit, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'flogo-transform-json-panel',
  // moduleId: module.id,
  templateUrl: 'transform-json-panel.tpl.html',
  styleUrls: ['transform-json-panel.component.less']
})
export class TransformJsonPanelComponent implements OnChanges, OnInit {
  @Input() schema: any = {};
  @Input() name = '';
  @Input() isInput = false;
  @Input() currentFieldSelected: any = {};
  isCollapsed = true;
  currentSchema: any = '';

  @Output()
  toggled: EventEmitter<any> = new EventEmitter();

  constructor(private sanitizer: DomSanitizer) {

  }

  ngOnInit() {
    if (this.isInput) {
      this.currentSchema = this.sanitizer.bypassSecurityTrustHtml(this.getFormattedHTMLInput(this.schema, ''));
    } else {
      this.currentSchema = this.sanitizer.bypassSecurityTrustHtml(this.getFormattedHTMLOutput(this.schema, '', ''));
    }
  }

  ngOnChanges(changes: any) {

    if (_.has(changes, 'currentFieldSelected')) {
      const itemSelected = changes.currentFieldSelected.currentValue;

      if (!_.isEmpty(itemSelected)) {
        if (this.isInput) {
          if (itemSelected.tile) {
            itemSelected.name = '';
          }
          this.currentSchema = this.sanitizer.bypassSecurityTrustHtml(this.getFormattedHTMLInput(this.schema, itemSelected.name || ''));
        } else {
          this.currentSchema = this.sanitizer.bypassSecurityTrustHtml(
            this.getFormattedHTMLOutput(this.schema, itemSelected.tile || '', itemSelected.name || '')
          );
        }
      }
    }
  }

  togglePanel() {

    this.isCollapsed = !this.isCollapsed;

    this.toggled.emit({
      isInput: this.isInput,
      isCollapsed: this.isCollapsed
    });

    if (!this.isCollapsed) {
      if (this.isInput) {
        this.currentSchema = this.sanitizer.bypassSecurityTrustHtml(this.getFormattedHTMLInput(this.schema, ''));
      } else {
        this.currentSchema = this.sanitizer.bypassSecurityTrustHtml(this.getFormattedHTMLOutput(this.schema, '', ''));
      }
    }

  }

  wrapInDiv(value: string, isSelected: boolean, leftMargin: string) {
    let html = '';

    html += `<div class="ft-json__selected"`;
    html += ' style="';

    if (isSelected) {
      html += 'font-weight:bold;';
    }

    if (leftMargin) {
      html += 'margin-left:' + leftMargin + ';';
    }

    html += '"';
    html += `>${value}</div>`;

    return html;
  }

  getFormattedHTMLInput(jsonSchema: any, fieldSelected: string) {
    let html = '';

    html += this.wrapInDiv('[', false, '-15px');

    let fieldCount = 1;

    jsonSchema.forEach((item: any) => {
      let isSelected = false;
      let coma = '';
      if (fieldCount < jsonSchema.length) {
        coma = ',';
      }
      if (fieldSelected === item.name) {
        isSelected = true;
      }

      html += this.wrapInDiv(`{`, isSelected, '10px');
      html += this.wrapInDiv(`"name":"${item.name}"`, isSelected, '20px');
      html += this.wrapInDiv(`"type":"${item.type}"`, isSelected, '20px');
      html += this.wrapInDiv(`}${coma}`, isSelected, '10px');

      fieldCount += 1;
    });


    /*
     for(var tile in jsonSchema) {
     // Check if is an array, in this case if is a tile
     if(jsonSchema[tile] instanceof Array) {

     html += this.wrapInDiv(`"${tile}":[`,false,'');

     let countField:number = 1;
     for(var fieldIndex in jsonSchema[tile]) {
     html += this.wrapInDiv('{', false,'10px');
     isSelected =  (tile == tileSelected && jsonSchema[tile][fieldIndex]['name'] == fieldSelected);

     for(var field in jsonSchema[tile][fieldIndex]) {
     html += this.wrapInDiv(`"${field}":"${jsonSchema[tile][fieldIndex][field]}"`, isSelected, '20px');
     }

     if(countField < jsonSchema[tile].length ) {
     html += this.wrapInDiv('},', false,'10px');
     } else {
     html += this.wrapInDiv('}', false,'10px');
     }

     countField += 1;
     }

     html += this.wrapInDiv(']', false,'');
     }
     }
     */

    html += this.wrapInDiv(']', false, '-15px');

    return html;
  }

  getFormattedHTMLOutput(jsonSchema: any, tileSelected: string, fieldSelected: string) {
    let html = '';
    let isSelected = false;

    html += this.wrapInDiv('{', false, '-10px');
    for (const tile in jsonSchema) {

      // Check if is an array, in this case if is a tile
      if (jsonSchema[tile] instanceof Array) {

        html += this.wrapInDiv(`"${tile}":[`, false, '');

        let countField = 1;
        for (const fieldIndex in jsonSchema[tile]) {
          if (!jsonSchema.hasOwnProperty(tile)) {
            continue;
          }
          html += this.wrapInDiv('{', false, '5px');
          isSelected = (tile === tileSelected && jsonSchema[tile][fieldIndex]['name'] === fieldSelected);

          for (const field in jsonSchema[tile][fieldIndex]) {
            if (jsonSchema[tile].hasOwnProperty(fieldIndex)) {
              html += this.wrapInDiv(`"${field}":"${jsonSchema[tile][fieldIndex][field]}"`,
                isSelected, '10px');
            }
          }

          if (countField < jsonSchema[tile].length) {
            html += this.wrapInDiv('},', false, '5px');
          } else {
            html += this.wrapInDiv('}', false, '5px');
          }

          countField += 1;
        }

        html += this.wrapInDiv(']', false, '');
      }
    }

    html += this.wrapInDiv('}', false, '-15px');

    return html;
  }

}
