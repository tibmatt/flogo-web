import {Injectable} from "angular2/core";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/Rx";

import {OfflineCheckerService as NetworkStatus} from "../poc-offline.checker/poc-offline.checker.service";
import {Github} from './Github'

const STORED_KEY = 'pocgithub.filestatus';

export class FileStatusService {

  static get parameters() {
    return [[NetworkStatus], [Github]]
  }

  constructor(networkStatus, github) {

    this._github = github;

    let initialState = this._loadInitialData();
    this._stateSource = new BehaviorSubject(initialState);

    this._savingStatusSource = new BehaviorSubject(false);

    let stateStream = this.state;

    stateStream.subscribe(state => this._storeState(state));

    this._saveStream = stateStream
      .map(state => state.pendingSave)
      .distinctUntilChanged()
      .share();

    networkStatus
      .networkStatusStream
      .combineLatest(this._saveStream, (isOnline, file) => ({isOnline, file}))
      .filter(state => state.isOnline && state.file && !!state.file.content)
      .map(state => state.file)
      .subscribe(file => {
        this._savingStatusSource.next(true);
        console.log(`Saving file`, file);
        this._doSave(file)
          .subscribe(res => {
            this._savingStatusSource.next(false);

            let nextState = this._stateSource.getValue();
            nextState.lastSync = new Date();
            nextState.pendingSave = null;
            this._stateSource.next(nextState);

            console.log('--> Saved ', res);
          }, err => {
            this._savingStatusSource.next(false);
            console.log('--> Not saved ', err);
          });
      });

  }

  contentSaved(repoInfo, content) {
    let nextState = this._stateSource.getValue();
    repoInfo = Object.assign({}, repoInfo);
    nextState.pendingSave = {repoInfo, content};
    nextState.lastSave = new Date();

    console.log('fileStatusService @ onContentSaved');
    console.log(nextState.pendingSave);

    this._stateSource.next(nextState);
  }

  get state() {
    return this._stateSource.asObservable();
  }

  get saveStream() {
    return this._saveStream;
  }

  get savingStatus() {
    return this._savingStatusSource.asObservable();
  }

  _doSave(file) {
    return this._github
      .updateFile(file.repoInfo.owner, file.repoInfo.name, file.repoInfo.filePath, file.content);
  }

  _storeState(state) {
    let stateToStore = Object.assign({}, state);
    if (stateToStore.lastSave) {
      stateToStore.lastSave = stateToStore.lastSave.toString();
    }


    if (stateToStore.lastSync) {
      stateToStore.lastSync = stateToStore.lastSync.toString();
    }

    localStorage.setItem(STORED_KEY, JSON.stringify(stateToStore))

  }

  _loadInitialData() {

    let savedState = null;
    try {
      savedState = JSON.parse(localStorage.getItem(STORED_KEY));
    } catch (e) {
      /* stored data was not json */
    }

    savedState = Object.assign({
      pendingSave: null,
      lastSave: null,
      lastSync: null
    }, savedState || {});

    if (savedState.lastSync) {
      savedState.lastSync = new Date(savedState.lastSync);
    }

    if (savedState.lastSave) {
      savedState.lastSave = new Date(savedState.lastSync);
    }

    return savedState;

  }


}
