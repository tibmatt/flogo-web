import {Injectable} from "angular2/core";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/Rx";

import {Github} from "./Github";
import {OfflineCheckerService as NetworkStatus} from "../poc-offline.checker/poc-offline.checker.service";

const STORED_STATE_KEY = 'pocgithub.appstate';

@Injectable()
export class StateService {

  static get parameters() {
    return [[Github], [NetworkStatus]]
  }


  constructor(github, networkStatus) {
    this._github = github;
    this._networkStatus = networkStatus;

    let initialState = this._loadState();
    this._stateSource = new BehaviorSubject(initialState);
    this._savedSource = new Subject();

    this.state.subscribe(newState => {
      localStorage.setItem(STORED_STATE_KEY, JSON.stringify(newState))
    });

    //this._setupSaveFileObserver(networkStatus.networkStatusStream);

  }

  get state() {
    return this._stateSource.asObservable();
  }

  setConfig(config) {
    let nextState = this._stateSource.getValue();
    nextState.repoConfig = Object.assign(nextState.repoConfig, config);
    this._stateSource.next(nextState);
  }

  setGithubToken(token) {
    let nextState = this._stateSource.getValue();
    nextState.githubToken = token;
    this._github.login(token);
    this._stateSource.next(nextState);
  }

  setFile(content) {
    let nextState = this._stateSource.getValue();
    nextState.file = content;
    this._stateSource.next(nextState);
  }

  setOffline(offline) {
    let nextState = this._stateSource.getValue();
    nextState.offline = offline;
    this._stateSource.next(nextState);
  }

  loadFile() {
    let state = this._stateSource.getValue();
    let repoConfig = state.repoConfig;
    let obs = this._github
      .readFile(repoConfig.repo.owner, repoConfig.repo.name, repoConfig.filePath)
      .map(res => typeof res == 'object' ? JSON.stringify(res) : res);
    state.loadingFile = true;

    obs.subscribe(
      res => {
        let nextState = this._stateSource.getValue();
        nextState.file = res;
        nextState.isConfigured = true;
        nextState.loadingFile = false;
        this._stateSource.next(nextState);
      },
      err => {
        console.log(err);
        if (err.error == 404) {

        }
      }
    );

    return obs;

  }

  saveFile() {
    let state = this._stateSource.getValue();
    this._savedSource.next(state.file);
  }

  ////////

  _setupSaveFileObserver(networkStatusStream) {
    networkStatusStream
      .combineLatest(this._savedSource.asObservable(), (isOnline, fileContent) => ({isOnline, fileContent}))
      .filter(state => state.isOnline && !!state.fileContent)
      .map(state => state.fileContent)
      .subscribe(fileContent => {
        console.log(`Saving file`, fileContent);
        this._doSave(fileContent)
          .subscribe(res => {
            this._savedSource.next(null);
            console.log('--> Saved ', res);
          }, err => {
            console.log('--> Not saved ', err);
          });
      });
  }

  _doSave(content) {
    let state = this._stateSource.getValue();
    let repoConfig = state.repoConfig;
    return this._github
      .updateFile(repoConfig.repo.owner, repoConfig.repo.name, repoConfig.filePath, content);
  }

  _loadState() {
    let savedState = JSON.parse(localStorage.getItem(STORED_STATE_KEY)) || {};
    return Object.assign({
      githubToken: null,
      isConfigured: false,
      repoConfig: {
        repo: {
          owner: null,
          name: null
        },
        filePath: null
      },
      file: null,
      offline: null
    }, savedState);
  }


}
