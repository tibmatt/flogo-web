import Pouchdb from 'pouchdb';
import path from 'path';
import npm from 'npm';
import _ from 'lodash';
import fs from 'fs';
import {DBService} from '../../common/db.service';
import {config} from '../../config/app-config';
import {BaseRegistered} from '../base-registered';

const defaultOptions = {
  type: "trigger",
  path: "packages/triggers",
  schemaJsonName: "trigger.json"
};

export class RegisterTriggers extends BaseRegistered{
  constructor(dbName, options){
    super(dbName, _.merge({}, defaultOptions, options||{}));
  }
}
