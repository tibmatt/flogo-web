import {config, triggersDBService} from '../../config/app-config';
import { TYPE_TRIGGER } from '../../common/constants';
import { RemoteInstaller } from '../../modules/remote-installer';
import _ from 'lodash';

let basePath = config.app.basePath;

let remoteInstaller = new RemoteInstaller( TYPE_TRIGGER );

export function triggers(app, router){
  if(!app){
    console.error("[Error][api/triggers/index.js]You must pass app");
  }
  router.get(basePath+"/triggers", getTriggers);
  router.post(basePath+"/triggers", installTriggers);
  router.delete(basePath+"/triggers", deleteTriggers);
}

function* getTriggers(next){
  let data = [];

  data = yield triggersDBService.allDocs({ include_docs: true })
    .then(triggers => triggers.map(trigger => {
      return Object.assign({}, _.pick(trigger, ['_id', 'name', 'title', 'version', 'description']), { title: _.get(trigger, 'schema.title')});
    }));

  this.body = data;
  yield next;
}

function* installTriggers( next ) {
  let urls = preProcessURLs( this.request.body.urls );

  console.log( '------- ------- -------' );
  console.log( 'Install Triggers' );
  __insp( urls );
  let results = yield remoteInstaller.install( urls );
  console.log( 'Installation results' );
  __insp( results );
  this.body = results;
  console.log( '------- ------- -------' );

  yield next;
}

function* deleteTriggers( next ) {

  console.log( '------- ------- -------' );
  console.log( 'Delete Triggers' );
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
