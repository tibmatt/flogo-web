import { ContribsManager  } from '../../../../modules/contribs'
import { ErrorManager } from '../../../../common/errors';

export function contribs(router, basePath){
  router.post(`${basePath}/contributions/devices`, installContribs);
  router.get(`${basePath}/contributions/devices`, listContribs);
  router.get(`${basePath}/contributions/devices/:name`, getContribution);
}

function *listContribs() {
  const types = {
    'trigger': 'flogo:device:trigger',
    'activity': 'flogo:device:activity',
  };

  const search = {};
  const type = this.request.query['filter[type]'];
  const ref = this.request.query['filter[ref]'];
  if(type) {
    search.type = (types[type]? types[type] : type);
  } else if(ref){
    search.ref = ref;
  }

  const foundContribs = yield ContribsManager.find(search);
  this.body = {
    data: foundContribs || [],
  };
}

function *getContribution()  {
  const name = this.params.name;

  const contribution = yield ContribsManager.findOne(name);
  this.body = { data: contribution };
}

function* installContribs( next ) {
  const url = preProcessURLs(this.request.body.url);

  let results = {};
    try {
      results = yield ContribsManager.install( [url] );
    } catch ( err ) {
      throw new Error( '[error] Encounter error to add contributions to test engine.' );
    }

  if(results.fail.length) {
    throw ErrorManager.createRestError('Installation error in /contributions installContribs', {
      status: 400,
      title: 'Installation error',
      detail: 'There were one or more installation contrib problems',
      meta: results,
    });
  }

  this.body =  {
    data: results
  };

  yield next;
}


function preProcessURLs( urls ) {
  'use strict';
  return urls;
}
