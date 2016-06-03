import _ from 'lodash';
import { expect } from 'chai';
import { EventHub } from './event-hub';
import { ERRORS } from '../constants';

describe( 'EventHub', function ( ) {
  describe( 'Creation', function ( ) {
    it( 'Is the event hub alive?', function ( ) {
      expect( EventHub.isAlive( ) )
        .to.be.true;
    } );

    it( 'toString()', function ( ) {
      expect( EventHub.toString( ) )
        .to.have.string( `Event Hub created at` );
    } );

    it( 'I need a new event hub.', function ( ) {
      let eventHub = EventHub.getEventHub( );
      let newEventHub = EventHub.getNewOne( );

      // both the new and old instance should work
      // when references are kept
      expect( eventHub.isAlive( ) )
        .to.be.true;
      expect( newEventHub.isAlive( ) )
        .to.be.true;

      // only the new one will be returned after `getNewOne`
      expect( EventHub.getEventHub( ) )
        .not.to.eql( eventHub );
      expect( EventHub.getEventHub( ) )
        .to.eql( newEventHub );
    } );
  } );

  describe( 'Basic work flow', function ( ) {
    let correctOpts = {
      name: 'jump',
      opts: {
        channel: 'creation-test',
        topic: 'jump'
      }
    };

    let optsWithoutName = {
      opts: {
        channel: 'creation-test',
        topic: 'jump'
      }
    };

    let creationRefError = _.clone( ERRORS[ '700' ] );
    let notFoundRefError = _.clone( ERRORS[ '404' ] );

    let prepareRegisterService = ( ) => {
      return EventHub.getNewOne( )
        .register( correctOpts );
    }

    it( 'Should be able to register a service.', function ( ) {

      return prepareRegisterService( )
        .then( ( service ) => {

          expect( service.publish )
            .to.be.instanceof( Function );

          return service;
        } );

    } );

    it( 'Should take care of invalid opts', function ( done ) {

      return EventHub.getNewOne( )
        .register( optsWithoutName )
        .catch( ( error ) => {

          expect( error )
            .to.eql( creationRefError );

          done( );

        } );

    } );

    it( 'Should be able to get a service.', function ( ) {

      return prepareRegisterService( )
        .then( ( ) => {
          return EventHub.get( correctOpts.name );
        } )
        .then( ( service ) => {

          expect( service.publish )
            .to.be.instanceof( Function );

          return service;
        } );

    } );

    it( 'Should take care of non-existing service.', function ( done ) {

      return prepareRegisterService( )
        .then( ( ) => {
          return EventHub.get( 'not exist' );
        } )
        .catch( ( error ) => {

          expect( error )
            .to.eql( notFoundRefError );

          done( );

        } );

    } );

    it( 'Should be able to get all of the services.', function ( ) {

      return prepareRegisterService( )
        .then( ( ) => {
          return EventHub.list( );
        } )
        .then( ( services ) => {

          expect( services )
            .to.be.instanceof( Array );

          expect( services.length )
            .to.equal( 1 );

          return services;
        } );

    } )

    it( 'Should be able to check the existence of a service.', function ( ) {

      return prepareRegisterService( )
        .then( ( ) => {

          let hasService = EventHub.exists( correctOpts.name );
          expect( hasService )
            .to.be.true;

          hasService = EventHub.exists( 'not exist' );
          expect( hasService )
            .to.be.false;

        } );

    } );

    it( 'Should be able to unregister a service.', function ( ) {

      return prepareRegisterService( )
        .then( ( service ) => {

          expect( EventHub.exists( service._name ) )
            .to.be.true;

          return EventHub.unregister( service._name )
            .then( ( ) => {
              expect( EventHub.exists( service._name ) )
                .to.be.false;
            } );

        } );

    } );

  } );

  describe( 'Basic Pub/Sub Work Flow ', function ( ) {
    let subjectName = 'jump-3-times';
    let jumpOpts = {
      name: subjectName,
      opts: {
        channel: 'event-hub-test',
        topic: 'jump-3-times'
      }
    };

    // reset EventHub
    EventHub.getNewOne( );

    it( 'jump for 3 times', function ( ) {

      let jumpCounter = 0;

      let jump = function jump( ) {
        return new Promise( ( resolve, reject ) => {

            setTimeout( ( ) => {

              let msg = `jump for the ${ jumpCounter++ } time..`;

              EventHub.notify( subjectName, {
                  data: { msg: msg }
                } )
                .then( resolve )
                .catch( reject );

            }, 5 );

          } )
          .then( ( ) => {
            if ( jumpCounter < 3 ) {
              return jump( );
            } else {

              let doneMsg = `Have jumped for 3 times.`;

              return EventHub.done( subjectName, {
                data: { msg: doneMsg }
              } );

            }
          } );
      };

      let srv;

      return new Promise( ( resolve, reject ) => {
        EventHub.register( jumpOpts )
          .then( ( ) => {

            srv = EventHub.get( subjectName );

            return EventHub.subscribe( subjectName, {
              on: ( data, envelope ) => {

                jump( )
                  .catch( reject );

              }
            } );

          } )
          .then( ( ) => {

            expect( srv._subs.length )
              .to.equal( 1 );

            return EventHub.publish( subjectName, {
              data: {
                msg: 'start jumping..'
              },
              done: ( data, envelope ) => {

                expect( jumpCounter )
                  .to.equal( 3 );

                expect( srv._subs.length )
                  .to.equal( 2 );

                // after triggered done, the subscriptions will be cleaned up
                // hence use async call
                setTimeout( ( ) => {

                  expect( srv._subs.length )
                    .to.equal( 1 );

                  resolve( );

                }, 0 );

              }
            } );

          } )
          .then( ( ) => {

            expect( srv._subs.length )
              .to.equal( 2 );

          } )
          .catch( reject );
      } );
    } );

    it( 'should handle error work flow', function ( ) {
      // depending on the test case `jump for 3 times`
      // the registration is done in that test case
      return new Promise( ( resolve, reject ) => {

        EventHub.publish( subjectName, {
            data: {
              msg: 'start jumping..'
            },
            done: ( data, envelope ) => {
              reject( 'Should not be run, since error should has removed this done subscription.' );
            },
            error: ( data, envelope ) => {
              resolve( );
            }
          } )
          .then( ( ) => {
            EventHub.error( subjectName, {
              data: { msg: 'random error' }
            } );
          } )
          .catch( reject );

      } );

    } );

  } );

} );
