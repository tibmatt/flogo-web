import { EventHub } from '../src/index.js';

let subjectName = 'jump-3-times';
let jumpOpts = {
  name: subjectName,
  opts: {
    channel: 'event-hub-test',
    topic: 'jump-3-times'
  }
};
let jumpCounter = 0;

function log( msg ) {

  let logElm = document.getElementById( 'output-msg' );
  console.info( msg );

  let outMsg = msg;

  try {
    outMsg = JSON.stringify( msg, true );
  } catch ( e ) {
    console.warn( e );
  }

  logElm.textContent = outMsg;

}

function resetEventHub( ) {
  // unregister the previously registered subject
  EventHub.unregister( subjectName );

  // get a brand new Event Hub internally
  EventHub.getNewOne( );

  // reset counter
  jumpCounter = 0;

  // reset button status
  disableJumpBtn( );

  // register the jump-3-times to the Event Hub
  return EventHub.register( jumpOpts )
    .then( ( ) => {

      disablePrepBtn( );
      enableStartBtn( );
      log( 'Event Registered.' );

      // subscribe to the `publish` events of the subject
      return EventHub.subscribe( subjectName, {
        on: ( data, envelope ) => {

          console.group( 'on message' );
          log( data );
          console.groupEnd( );

          // enable the jump-btn
          enableJumpBtn( );
          disableStartBtn( );

        }
      } );
    } );
}

function startJump( ) {

  // trigger the `on` event handler
  EventHub.publish( subjectName, {
    data: {
      msg: 'start jumping..'
    },

    // the `notify` event handler
    notify: ( data, envelope ) => {

      console.group( `Jumping ${jumpCounter} !` );
      log( data );
      console.groupEnd( );

    },

    // the `done` event handler
    done: ( data, envelope ) => {

      console.group( 'Done jumping!' );
      log( data );
      console.groupEnd( );

      // disable jump button when finished
      disableJumpBtn( );
      enablePrepBtn( );

    }
  } );
}

function triggerJump( ) {

  jumpCounter++;

  if ( jumpCounter < 3 ) {

    // trigger a `notify` event
    EventHub.notify( subjectName, {
      data: {
        msg: `Jump [ ${jumpCounter} ]`
      }
    } );

  } else {

    // trigger a `done` event
    EventHub.done( subjectName, {
      data: {
        msg: `Jump [ ${jumpCounter} ]`
      }
    } );

  }

}

function bindEvents( ) {

  let prepBtn = document.getElementById( 'prep-btn' );
  let startBtn = document.getElementById( 'start-btn' );
  let jumpBtn = document.getElementById( 'jump-btn' );

  prepBtn.addEventListener( 'click', ( evt ) => {

    resetEventHub( );

  } );

  startBtn.addEventListener( 'click', ( evt ) => {

    startJump( );

  } );

  jumpBtn.addEventListener( 'click', ( evt ) => {

    triggerJump( );

  } );
}

/* Button Toggle Functions */

function disableStartBtn( ) {

  let startBtn = document.getElementById( 'start-btn' );

  startBtn.setAttribute( 'disabled', '' );

}

function enableStartBtn( ) {

  let startBtn = document.getElementById( 'start-btn' );

  startBtn.removeAttribute( 'disabled' );

}

function disableJumpBtn( ) {

  let jumpBtn = document.getElementById( 'jump-btn' );

  jumpBtn.setAttribute( 'disabled', '' );

}

function enableJumpBtn( ) {

  let jumpBtn = document.getElementById( 'jump-btn' );

  jumpBtn.removeAttribute( 'disabled' );

}

function disablePrepBtn( ) {

  let prepBtn = document.getElementById( 'prep-btn' );

  prepBtn.setAttribute( 'disabled', '' );

}

function enablePrepBtn( ) {

  let prepBtn = document.getElementById( 'prep-btn' );

  prepBtn.removeAttribute( 'disabled' );

}

/* bootstrap system */
bindEvents( );
resetEventHub( );
