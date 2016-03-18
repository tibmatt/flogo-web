import {Component, EventEmitter} from 'angular2/core';
import {NgForm}    from 'angular2/common';

@Component({
  selector: 'pocgithub-config',
  templateUrl: './poc-github.config/config.template.html',
  inputs: ['config', 'isReloadPermitted'],
  outputs: ['onSubmit'],
  styles: [`
    .pocgithub-config {
      margin-top: 15px;
    }
  `]
})
export class ConfigComponent {

  static get dependencies() {
    return [[]];
  }

  constructor () {
    this.model = {
      repo: {
        owner: null,
        name: null
      },
      filePath: null
    };
    this.isReloadPermitted = true;

    this.onSubmit = new EventEmitter();

  }

  ngOnChanges (changes) {
    if(changes.config) {
      this.model = changes.config.currentValue;
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    this.onSubmit.next(this.model);
  }
}
