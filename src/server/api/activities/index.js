import {config, activitiesDBService} from '../../config/app-config';
import { TYPE_ACTIVITY } from '../../common/constants';
import { RemoteInstaller } from '../../modules/remote-installer';
import _ from 'lodash';

let basePath = config.app.basePath;

let remoteInstaller = new RemoteInstaller( TYPE_ACTIVITY );

export function activities(app, router){
  if(!app){
    console.error("[Error][api/activities/index.js]You must pass app");
  }

  router.get(basePath+"/activities", getActivities);
  router.post(basePath+"/activities", installActivities);
  router.delete(basePath+"/activities", deleteActivities);
}

function* getActivities(next){
  let data = yield activitiesDBService.allDocs({ include_docs: true })
    .then(activities => activities.map(activity => {
      return Object.assign({}, _.pick(activity, ['_id', 'name', 'title', 'version', 'description']), { title: _.get(activity, 'schema.title') });
    }));

  this.body = data;
  yield next;
}

function* installActivities( next ) {
  let urls = preProcessURLs( this.request.body.urls );
  console.log( '[log] Install Activities' );
  __insp( urls );
  let results = yield remoteInstaller.install( urls );
  console.log( '[log] Installation results' );
  __insp( results );
  this.body = results;

  yield next;
}

function* deleteActivities(next){
  console.log( '------- ------- -------' );
  console.log( 'Delete Activities' );
  console.log( this.request.body.urls );
  this.body = 'TODO';
  console.log( '------- ------- -------' );

  yield next;
}

function preProcessURLs( urls ) {
  'use strict';
  // TODO
  return urls;
}

// ------- ------- -------
// debugging inspector utility
function __insp( obj ) {
  'use strict';
  console.log( require( 'util' )
    .inspect( obj, { depth : 7, colors : true } ) );
}
