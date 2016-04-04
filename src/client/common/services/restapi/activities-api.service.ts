import { Injectable } from 'angular2/core';
import { FlogoDBService } from '../db.service';

@Injectable()
export class RESTAPIActivitiesService{
  constructor(private _db: FlogoDBService){
  }
}
