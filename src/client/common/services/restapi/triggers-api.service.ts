import {Injectable} from 'angular2/core';
import {FlogoDBService} from '../db.service';

@Injectable()
export class  RESTAPITriggersService {
  constructor(private _db: FlogoDBService) {
  }

  getTriggers() {
    return this._db.getAllTriggers();
  }

}
