'use strict';
import _ from 'lodash';
import moment from 'moment';
import { ERRORS } from '../constants';
import { EventService } from './event-service';

let Hub = {};
let eventHub = null;

class EventHub {

  constructor( ) {
    this._created = moment( );
    this._subjects = {};
  }

  isAlive( ) {
    return true;
  }

  toString( ) {
    return `Event Hub created at ${ this._created.toString( ) }`;
  }

  // ------- ------- -------
  //  official APIs below
  // ------- ------- -------

  register( opts ) {
    // opts: {
    //   name: 'subject-name', // [required] subject name for quick referencing
    //   opts: {
    //     channel: 'channel-name', // [optional] postal channel, fall back to the default channel when omitted
    //     topic: 'topic-name' // [required] postal topic
    //   }
    // }

    return new Promise( ( resolve, reject ) => {

      // validation is inside the constructor of EventService class

      let evtSrv = new EventService( opts );

      this._subjects[ evtSrv._name ] = evtSrv;

      resolve( evtSrv );

    } );
  }

  unregister( subjectName ) {
    return new Promise( ( resolve, reject ) => {

      let subject = _.get( this._subjects, subjectName );
      if ( subject instanceof EventService ) {
        subject.reset( );
      }

      resolve( _.unset( this._subjects, subjectName ) );
    } );
  }

  list( ) {
    return _.keys( this._subjects );
  }

  get( subjectName ) {
    let subject = _.get( this._subjects, subjectName );

    if ( subject ) {
      return subject
    } else {
      throw _.clone( ERRORS[ '404' ] );
    }
  }

  exists( subjectName ) {
    return _.has( this._subjects, subjectName );
  }

  // ------- ------- -------
  //  Shorthand APIs of Event Services
  // ------- ------- ------

  subscribe( subjectName, opts ) {
    // opts: {
    //   on: onMessageCallback,
    //   notify: notifyCallback,
    //   done: doneCallback,
    //   error: errorCallback
    // }

    let self = this;

    return new Promise( ( resolve, reject ) => {

      let subject = self.get( subjectName );

      let unsub = subject.subscribe( opts );

      resolve( unsub );

    } );
  }

  publish( subjectName, opts ) {

    let self = this;

    return new Promise( ( resolve, reject ) => {

        let subject = self.get( subjectName );

        resolve( subject );

      } )
      .then( ( subject ) => {
        return subject.publish( opts );
      } );

  }

  notify( subjectName, opts ) {

    let self = this;

    return new Promise( ( resolve, reject ) => {

        let subject = self.get( subjectName );

        resolve( subject );

      } )
      .then( ( subject ) => {
        return subject.notify( opts );
      } );

  }

  done( subjectName, opts ) {

    let self = this;

    return new Promise( ( resolve, reject ) => {

        let subject = self.get( subjectName );

        resolve( subject );

      } )
      .then( ( subject ) => {
        return subject.done( opts );
      } );

  }

  error( subjectName, opts ) {

    let self = this;

    return new Promise( ( resolve, reject ) => {

        let subject = self.get( subjectName );

        resolve( subject );

      } )
      .then( ( subject ) => {
        return subject.error( opts );
      } );

  }
}


// ------- ------- -------
//  Exported APIs
// ------- ------- -------

Hub.getEventHub = function getEventHub( ) {
  if ( eventHub instanceof EventHub ) {
    return eventHub;
  } else {
    return this.getNewOne( );
  }
}

Hub.getNewOne = function getNewEventHub( ) {
  eventHub = new EventHub( );
  return eventHub;
}

// ------- ------- -------
//  Exported Event Hub APIs
// ------- ------- -------

const APIS_TO_EXPORT = [
  'isAlive',
  'toString',
  'register',
  'unregister',
  'list',
  'get',
  'exists',
  'subscribe',
  'publish',
  'notify',
  'done',
  'error'
];

_.each( APIS_TO_EXPORT, ( apiName ) => {
  Hub[ apiName ] = ( ...args ) => {
    let evtHub = Hub.getEventHub( );
    return evtHub[ apiName ].apply( evtHub, args );
  }
} );

export { Hub as EventHub };
