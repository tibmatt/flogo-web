import {Component, View, NgZone} from 'angular2/core';
import {NgForm}    from 'angular2/common';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {OfflineCheckerService} from '../poc-offline.checker/poc-offline.checker.service';
import {OfflineCheckerDirective} from '../poc-offline.checker/poc-offline.checker.directive';

import {StateService} from '../lib/StateService';
import {UIStateService} from '../lib/UIStateService';
import {FileStatusService} from '../lib/FileStatusService';
import {Auth} from '../lib/Auth';

import {ConfigComponent} from '../poc-github.config/config.component';
import {EditorComponent} from '../poc-github.editor/editor.component';

@Component({
  selector: 'demo-app',
  templateUrl: './demo.app.component/templates/demo.app.component.template.html',
  directives: [ConfigComponent, EditorComponent, OfflineCheckerDirective],
  providers: [StateService, OfflineCheckerService, UIStateService, FileStatusService]
})

export class DemoAppComponent {
  onlineState;

  static get parameters() {
    return [[Auth], [StateService], [OfflineCheckerService], [FileStatusService], [UIStateService], [NgZone]]
  }

  constructor(auth, stateService, offlineCheckerService, fileService, uiStateService, ngZone) {
    this._auth = auth;
    this._zone = ngZone;

    this._offlineCheckerService = offlineCheckerService;
    this._stateService = stateService;
    this._fileService = fileService;
    this._uiStateService = uiStateService;

    this.state = {};
    this.uiState = {};
    this.fileState = {};

    this._auth.getGithubToken()
      .subscribe(token => this._stateService.setGithubToken(token));

  }

  ngOnInit() {
    this._stateService.state.subscribe(state => {
      this.state = state;
    });

    this._uiStateService.state.subscribe(nextState => {
      this._zone.run(() => {
        this.uiState = Object.assign({}, nextState);
      });
    });

    this._fileService.state.subscribe(nextState => {
      this._zone.run(() => {
        this.fileState = Object.assign({}, nextState)
      });
    });

  }

  load(repoConfig) {
    this._stateService.setConfig(repoConfig);
    this._stateService.loadFile().subscribe(res => {
      console.log(res);
    }, err => console.log('not loaded'));
  }

  save(newContent) {
    let repoConfig = this.state.repoConfig;

    // todo: remove, only for demo to store changes locally, _fileService should store locally
    this._stateService.setFile(newContent);

    this._fileService.contentSaved({
      name: repoConfig.repo.name,
      owner: repoConfig.repo.owner,
      filePath: repoConfig.filePath
    }, newContent);
  }

}
