import Pouchdb from 'pouchdb';
import path from 'path';
import npm from 'npm';
import _ from 'lodash';
import fs from 'fs';
import {DBService} from '../../common/db.service';
import {config} from '../../config/app-config';
import {BaseRegistered} from '../base-registered';

const defaultOptions = {
  type: "activity",
  path: "packages/activities",
  schemaJsonName: "activity.json"
};

export class RegisterActivities extends BaseRegistered{
  constructor(dbName, engine, options){
    super(dbName, engine, _.merge({}, defaultOptions, options||{}));
  }
}
