'use strict';
import _ from 'lodash';
import moment from 'moment';
import postal from 'postal';
import { ERRORS, EVENT_SERVICE_CONFIG as _CONFIG } from '../constants';

export class EventService {
  constructor( opts ) {
    // opts: {
    //   name: 'subject-name', // [required] subject name for quick referencing
    //   opts: {
    //     channel: 'channel-name', // [optional] postal channel, fall back to the default channel when omitted
    //     topic: 'topic-name' // [required] postal topic
    //   }
    // }

    if ( this.isConstructOptsValid( opts ) ) {

      this._created = moment( );

      // the default name of the service is the created time
      this._name = _.get( opts, 'name', this._created.format( ) );

      // create channel + topic configuration of postal

      this._postalCfgs = {
        'on': _genPostCfg( _.get( opts, 'opts' ) )
      };

      this._postalCfgs.notify = _genPostCfg( this._postalCfgs.on, _CONFIG.AFFIX.PROC );

      this._postalCfgs.done = _genPostCfg( this._postalCfgs.on, _CONFIG.AFFIX.DONE );

      this._postalCfgs.error = _genPostCfg( this._postalCfgs.on, _CONFIG.AFFIX.ERR );

      // used to store subscriptions
      this._subs = [ ];

      // used to store the unsub functions of publish
      this._pubUnsubs = [ ];

      // used as the id of the new subscription
      this._idCounter = 0;

    } else {
      throw _.cloneDeep( ERRORS[ '700' ] );
    }

  }

  // ------- ------- -------
  //  internal utility APIs below
  // ------- ------- -------

  isConstructOptsValid( opts ) {

    // [required] opts.name

    if ( !_.get( opts, 'name' ) ) {
      return false;
    }

    // [required] opts.opts.topic

    if ( !_.get( opts, 'opts.topic' ) ) {
      return false;
    }

    return true;
  }

  // ------- ------- -------
  //  official APIs below
  // ------- ------- -------

  subscribe( opts ) {
    let self = this;
    let sub = _.assign( {
      _id: self._idCounter++,
      _created: moment( ),
      _unsubs: [ ]
    }, opts );

    if ( _hasCallback( opts ) ) {

      self._subs.push( sub );

      _bindEvents( sub._unsubs, opts, self._postalCfgs );

      return function unsubscribe( ) {

        _.each( sub._unsubs, ( unsub ) => {
          let fn = _.get( unsub, 'unsubscribe' );

          if ( _.isFunction( fn ) ) {
            fn.bind( unsub )( );
          }
        } );

        _.remove( self._subs, ( s, idx ) => {
          return s._id === sub._id;
        } );

      }
    } else {
      // noop
      return ( ) => void( 0 );
    }
  }

  publish( opts ) {

    let self = this;

    return new Promise( ( resolve, reject ) => {

      let data = _.get( opts, 'data' );

      // notify/done/error handlers
      let unsub = self.subscribe( opts );

      _pubInPostal( self._postalCfgs.on, data );

      self._pubUnsubs.push( unsub );

      resolve( unsub );

    } );
  }

  notify( opts ) {

    let self = this;

    return new Promise( ( resolve, reject ) => {

      let data = _.get( opts, 'data' );

      // notify/done/error handlers
      let unsub = self.subscribe( opts );

      _pubInPostal( self._postalCfgs.notify, data );

      self._pubUnsubs.push( unsub );

      resolve( unsub );

    } );
  }

  done( opts ) {

    let self = this;

    return new Promise( ( resolve, reject ) => {

        let data = _.get( opts, 'data' );

        // notify/done/error handlers
        let unsub = self.subscribe( opts );

        _pubInPostal( self._postalCfgs.done, data );

        resolve( unsub );

      } )
      .then( ( unsub ) => {

        _triggerPubUnsubs.call( self );

        return unsub;
      } );
  }

  error( opts ) {

    let self = this;

    return new Promise( ( resolve, reject ) => {

        let data = _.get( opts, 'data' )

        // notify/done/error handlers
        let unsub = self.subscribe( opts );;

        _pubInPostal( self._postalCfgs.error, data );

        resolve( unsub );

      } )
      .then( ( unsub ) => {

        _triggerPubUnsubs.call( self );

        return unsub;
      } );
  }

  reset( ) {

    // unsubscribe all of the subscriptions

    _.each( this._subs, ( sub ) => {
      _.each( sub._unsubs, ( unsub ) => {
        let fn = _.get( unsub, 'unsubscribe' );

        if ( _.isFunction( fn ) ) {
          fn.bind( unsub )( );
        }
      } );
    } );
    this._subs = [ ];

  }
}

// ------- ------ --------
//  private utility functions
// ------- ------ --------
function _hasCallback( opts ) {

  let keys = _.keys( opts );

  return _.some( [ 'on', 'notify', 'done', 'error' ], ( type ) => {
    return _.includes( keys, type );
  } );
}

function _genPostCfg( cfg, affix ) {

  let _postalCfg = _.cloneDeep( cfg );
  _postalCfg.topic += affix || '';

  return _postalCfg;
}

function _subToPostal( cfg, cb ) {

  return postal.subscribe( _.assign( _.cloneDeep( cfg ), {
    callback: cb
  } ) );
}

function _bindEvents( unsubs, opts, cfgs ) {

  _.each( [ 'on', 'notify', 'done', 'error' ], ( type ) => {

    let fn = _.get( opts, type );

    if ( _.isFunction( fn ) ) {
      unsubs.push( _subToPostal( cfgs[ type ], fn ) );
    }

  } );

}

function _pubInPostal( cfg, data ) {

  return postal.publish( _.assign( _.cloneDeep( cfg ), {
    data: data
  } ) );
}

// need to bind `this` to service instance.
function _triggerPubUnsubs( ) {
  let service = this;

  let unsubs = _.get( service, '_pubUnsubs' );

  if ( unsubs ) {
    _.each( unsubs, ( unsub ) => {
      if ( _.isFunction( unsub ) ) {
        unsub( );
      }
    } );

    service._pubUnsubs = [ ];
  }

}
