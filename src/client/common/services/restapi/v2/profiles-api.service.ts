import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {HttpUtilsService} from "../http-utils.service";
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ProfilesAPIService {
  constructor(private _http: Http, private _httpUtils: HttpUtilsService) {

  }

  getProfilesList() {
    return this._http.get(this._httpUtils.apiPrefix('profiles'), this._httpUtils.defaultOptions()).toPromise()
      .then(response => response.json().data);
  }
}
