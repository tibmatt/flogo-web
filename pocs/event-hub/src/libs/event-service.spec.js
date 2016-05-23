import _ from 'lodash';
import postal from 'postal';
import { expect } from 'chai';
import { EventService } from './event-service';
import { ERRORS } from '../constants';

const correctOpts = {
  name: 'jump',
  opts: {
    channel: 'event-service-test',
    topic: 'jump'
  }
};

const optsWithoutName = {
  opts: {
    channel: 'event-service-test',
    topic: 'jump'
  }
};

const optsWithoutChannel = {
  name: 'jump',
  opts: {
    topic: 'jump'
  }
};

const optsWithoutTopic = {
  name: 'jump',
  opts: {
    channel: 'event-service-test',
  }
};

const creationRefError = _.clone( ERRORS[ '700' ] );

describe( 'EventService', function ( ) {
  describe( 'Creation', function ( ) {

    it( 'should be created use new operator', function ( ) {
      let create = ( ) => {
        let evtSrv = new EventService( correctOpts );
      };

      expect( create )
        .to.not.throw( creationRefError );
    } );

    it( 'should report error when create with opts without name', function ( ) {
      let create = ( ) => {
        let evtSrv = new EventService( optsWithoutName );
      };

      expect( create )
        .to.throw( creationRefError );
    } );

    it( 'should report error when create with opts without topic', function ( ) {
      let create = ( ) => {
        let evtSrv = new EventService( optsWithoutTopic );
      };

      expect( create )
        .to.throw( creationRefError );
    } );

    it( 'should not report error when create with opts without channel', function ( ) {
      let create = ( ) => {
        let evtSrv = new EventService( optsWithoutChannel );
      };

      expect( create )
        .to.not.throw( creationRefError );
    } );

  } );

  describe( 'Basic Pub/Sub Work Flow', function ( ) {

    let msgCounter = 0;

    let cbGenerator = ( type ) => {
      return ( data, envelope ) => {

        expect( data.msg )
          .to.equal( `message ${ type }` );

        msgCounter++;
      };
    }

    let pubAllMsgs = ( srv ) => {
      // reset message counter
      msgCounter = 0;

      let promises = [ ];

      promises.push( srv.publish( {
        data: { msg: 'message on' },
        notify: cbGenerator( 'notify' ),
        done: cbGenerator( 'done' ),
        error: cbGenerator( 'error' )
      } ) );

      promises.push( srv.notify( {
        data: { msg: 'message notify' }
      } ) );

      promises.push( srv.done( {
        data: { msg: 'message done' }
      } ) );

      promises.push( srv.error( {
        data: { msg: 'message error' }
      } ) );

      return Promise.all( promises );
    }

    beforeEach( ( ) => {
      postal.reset( );
    } );

    it( 'should be able to subscribe to a service', function ( ) {

      let evtSrv = new EventService( correctOpts );
      let types = [ 'on', 'notify', 'done', 'error' ];

      let unsub = evtSrv.subscribe( _.transform( types, ( result, type ) => {

        result[ type ] = ( data, envelope ) => {

        };

        return true;
      }, {} ) );

      expect( unsub )
        .to.be.instanceof( Function );

      expect( evtSrv._subs.length )
        .to.equal( 1 );

      expect( unsub )
        .to.not.throw( Error );

      expect( evtSrv._subs.length )
        .to.equal( 0 );
    } );

    it( 'should be able to publish a message to subscribers', function ( ) {

      let evtSrv = new EventService( correctOpts );
      let types = [ 'on', 'notify', 'done', 'error' ];

      let subscriber = _.transform( types, ( result, type ) => {

        result[ type ] = cbGenerator( type );

        return true;
      }, {} );

      let unsub = evtSrv.subscribe( subscriber );

      expect( evtSrv._subs.length )
        .to.equal( 1 );

      return pubAllMsgs( evtSrv )
        .then( ( unsubs ) => {

          expect( unsubs.length )
            .to.equal( types.length );

          expect( msgCounter )
            .to.equal( 7 );

          expect( evtSrv._subs.length )
            .to.equal( 1 );

          _.each( unsubs, ( unsub ) => {

            expect( unsub )
              .to.be.instanceof( Function )
              .and.not.throw( Error );

          } );

          expect( evtSrv._subs.length )
            .to.equal( 1 );

        } );

    } );

    it( 'should be able to clean up all subscriptions', function ( ) {

      let evtSrv = new EventService( correctOpts );
      let types = [ 'on', 'notify', 'done', 'error' ];

      let subscriber = _.transform( types, ( result, type ) => {

        result[ type ] = cbGenerator( type );

        return true;
      }, {} );

      let unsub = evtSrv.subscribe( subscriber );

      return pubAllMsgs( evtSrv )
        .then( ( unsubs ) => {

          _.each( unsubs, ( unsub ) => {

            expect( unsub )
              .to.be.instanceof( Function )
              .and.not.throw( Error );

          } );

          evtSrv.reset( );

          expect( evtSrv._subs.length )
            .to.equal( 0 );

          return pubAllMsgs( evtSrv );
        } )
        .then( ( unsubs ) => {

          expect( unsubs.length )
            .to.equal( types.length );

          expect( evtSrv._subs.length )
            .to.equal( 0 );

          expect( msgCounter )
            .to.equal( 3 );

        } );

    } );

    it( 'should be able to automatically unsubscribe callback registered during `publish`/`notify`.', function ( ) {

      let evtSrv = new EventService( correctOpts );

      let subscriber = {
        'on': ( data, envelope ) => {

          expect( data.msg )
            .to.equal( `message on` );

        }
      };

      let unsub = evtSrv.subscribe( subscriber );

      return evtSrv.publish( {
          data: { msg: 'message on' },
          notify: ( data, envelope ) => {

            expect( data.msg )
              .to.equal( `message notify` );

            msgCounter++;
          },
          done: ( data, envelope ) => {

            expect( data.msg )
              .to.equal( `message done` );

          },
          error: cbGenerator( 'error' )
        } )
        .then( ( unsub ) => {
          // reset message counter;
          msgCounter = 0;

          return evtSrv.notify( {
            data: { msg: 'message notify' }
          } );
        } )
        .then( ( unsub ) => {

          expect( msgCounter )
            .to.equal( 1 );

        } )
        .then( ( unsub ) => {
          return evtSrv.done( {
            data: { msg: 'message done' }
          } );
        } )
        .then( ( unsub ) => {
          // reset message counter;
          msgCounter = 0;

          return evtSrv.notify( {
            data: { msg: 'message notify' }
          } );
        } )
        .then( ( unsub ) => {

          expect( msgCounter )
            .to.equal( 0 );

        } );

    } );

  } );
} );
