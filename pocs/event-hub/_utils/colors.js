import chalk from 'chalk';
import moment from 'moment';

const OUT_TIME_FMT = 'HH.mm.ss.SSS';

export let C = {
  highlight: chalk.cyan,
  time: chalk.gray,
  info: chalk.reset,
  warn: chalk.yellow,
  error: chalk.red,
  debug: chalk.blue,
  help: chalk.green
};

export let O = {
  log: ( msg, ...args ) => {
    console.log( `[${ C.time( moment().format( OUT_TIME_FMT ) ) }] [${ C.debug( 'LOG' ) }] ${ C.debug.call( this, msg ) }`, args.length ? args : '' )
  },
  warn: ( msg, ...args ) => {
    console.warn( `[${ C.time( moment().format( OUT_TIME_FMT ) ) }] [${ C.debug( 'WARN' ) }] ${ C.warn.call( this, msg ) }`, args.length ? args : '' )
  },
  error: ( msg, ...args ) => {
    console.error( `[${ C.time( moment().format( OUT_TIME_FMT ) ) }] [${ C.debug( 'ERROR' ) }] ${ C.error.call( this, msg ) }`, args.length ? args : '' )
  },
  info: ( msg, ...args ) => {
    console.info( `[${ C.time( moment().format( OUT_TIME_FMT ) ) }] [${ C.debug( 'INFO' ) }] ${ C.info.call( this, msg ) }`, args.length ? args : '' )
  }
}
