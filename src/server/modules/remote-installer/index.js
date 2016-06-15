import {
  TYPE_TRIGGER,
  TYPE_ACTIVITY,
  TYPE_UNKNOWN,
  // SCHEMA_FILE_NAME_TRIGGER,
  // SCHEMA_FILE_NAME_ACTIVITY
} from '../../common/constants';
import { config } from '../../config/app-config';
import _ from 'lodash';
import path from 'path';

// TODO support more git format
//  for the moment
//    https://github.com/:username/:projectname.git
//    https://github.com/:username/:projectname
const GITHUB_URL_PATTERN = /^(?:https\:\/\/)?github\.com\/(?:([\w\-]+)\/)(?:([\w\-]+)(?:\.git)?)$/.source;

// TODO
// update this information. the `somefile.json` is only for testing.
// should use the imported ones from constants.
const SCHEMA_FILE_NAME_TRIGGER = 'somefile.json';
const SCHEMA_FILE_NAME_ACTIVITY = 'somefile.json';

/*
 * Utility functions to be extracted to utility module.
 * TODO
 */

function isGitHubURL( url ) {
  let pattern = new RegExp( GITHUB_URL_PATTERN );
  return pattern.test( url );
}

function parseGitHubURL( url ) {
  let pattern = new RegExp( GITHUB_URL_PATTERN );
  let parsed = url.match( pattern );

  return {
    url : url,
    username : parsed[ 1 ],
    projectName : parsed[ 2 ]
  };
}

/**
 * Remote Installer class
 */
export class RemoteInstaller {

  constructor( type ) {
    this.type = type || TYPE_UNKNOWN;
  }

  install( sourceURLs ) {
    return new Promise( ( resolve, reject )=> {

      // parse the URL
      //  1. from GitHub
      //  2. from generic web server
      let parsedURLs = _.reduce( sourceURLs, ( result, url, idx )=> {
        if ( isGitHubURL( url ) ) {
          result.github.push( url );
        } else {
          result.default.push( url );
        }

        return result;
      }, { github : [], default : [] } );

      let result = {
        github : null,
        default : null
      };

      this.installFromGitHub( parsedURLs.github )
        .then( ( githubResult )=> {
          result.github = githubResult;

          return this.defaultInstall( parsedURLs.default );
        } )
        .then( ( defaultResult )=> {
          result.default = defaultResult;

          return result;
        } )
        .then( resolve )
        .catch( reject );
    } );
  }

  installFromGitHub( sourceURLs ) {
    return new Promise( ( resolve, reject )=> {
      console.log( '------- ------- -------' );
      console.log( 'Install from GitHub' );
      console.log( sourceURLs );

      let installPromise = null;

      switch ( this.type ) {
        case TYPE_ACTIVITY:
          installPromise = installActivity();
          break;
        case TYPE_TRIGGER:
          installPromise = installTrigger();
          break;
        default:
          throw new Error( 'Unknown Type' );
          break;
      }

      installPromise.then( ( result )=> {
        console.log( 'Installed' );

        return result;
      } )
        .then( resolve )
        .catch( reject );

      console.log( '------- ------- -------' );
    } );
  }

  // TODO
  defaultInstall( sourceURLs ) {
    return new Promise( ( resolve, reject )=> {
      console.log( '------- ------- -------' );
      console.log( 'Default installation [TODO]' );
      console.log( sourceURLs );
      resolve( sourceURLs );
      console.log( '------- ------- -------' );
    } );
  }
}

// ------- ------- -------
// utility functions

function installTrigger() {
  // TODO
  return Promise.resolve( true );
}

function installActivity() {
  // TODO
  return Promise.resolve( true );
}

// ------- ------- -------
// debugging inspector utility
function __insp( obj ) {
  'use strict';
  console.log( require( 'util' )
    .inspect( obj, { depth : 7, colors : true } ) );
}
