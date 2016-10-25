import { config } from '../../config/app-config';
import { isJSON } from '../../common/utils';
import _ from 'lodash';
import request  from 'co-request';
import path from 'path';

let basePath = config.app.basePath;

export function samples(app, router) {
  if(!app) {
    console.error("[Error][api/samples/index.js]You must pass app");
  }
  router.get(basePath+'/samples', samplesList);
}


function* samplesList(next) {
  let samples = [
    {
      name:"AWS IOT Sample",
      description: "A sample flow to update AWS IOT Shadow",
      json: "https://raw.githubusercontent.com/TIBCOSoftware/flogo/master/samples/aws_iot/web/aws_iot.json"
    }
  ];

  this.body = samples;

  yield next;
}





