import {Component, EventEmitter} from 'angular2/core';
import {NgForm}    from 'angular2/common';

import moment from 'moment';

@Component({
  selector: 'pocgithub-editor',
  templateUrl: './poc-github.editor/editor.template.html',
  inputs: ['content', 'uiState', 'fileStatus'],
  outputs: ['onSave'],
  styles: [`
    .pocgithub-editor {
      margin-top: 15px;
    }
  `]
})
export class EditorComponent {

  editing = null;

  static get dependencies() {
    return [[]];
  }

  constructor () {
    this.onSave = new EventEmitter();
  }

  ngOnChanges (changes) {
    if(changes.content) {
      this.editing = changes.content.currentValue;
    }
  }

  handleSave(event) {
    event.preventDefault();
    this.onSave.next(this.editing);
  }
}
