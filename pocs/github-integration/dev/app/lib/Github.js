import {Injectable} from 'angular2/core';
import GithubApi from 'github-api';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class Github {

  constructor() {
    this._api = this._createApiInstance();
  }

  login(authToken) {
    console.log('logged in', authToken);
    this._api = this._createApiInstance({
      token: authToken,
      auth: 'oauth'
    });
  }

  loadRepoInfo(username, reponame) {
    var repo = this._api.getRepo(username, reponame);
    return Observable.bindNodeCallback(repo.show)();
  }

  loadFile(username, reponame, path, branch = 'master') {
    var repo = this._api.getRepo(username, reponame);
    return Observable
      .bindNodeCallback(repo.contents)(branch, path)
      .map(res => res[0])
      .share();
  }

  readFile(username, reponame, path, branch = 'master') {
    var repo = this._api.getRepo(username, reponame);
    return Observable
      .bindNodeCallback(repo.read)(branch, path)
      .map(res => res[0])
      .share();
  }

  updateFile(username, reponame, path, content, branch = 'master') {
    var repo = this._api.getRepo(username, reponame);
    let options = {
      author: {name: 'Foo Bar', email: 'foobar@example.com'},
      commiter: {name: 'Foo Bar', email: 'foobar@example.com'},
      encode: true
    };
    return Observable
      .bindNodeCallback(repo.write)(branch, path, content, 'update', options)
      .map(res => res[0])
      .share();
  }

  _createApiInstance(opts = {}) {
    opts = Object.assign({
      //apiUrl: 'http://api.github.com' // overwrite to use http
    }, opts);
    return new GithubApi(opts);
  }


}
