import {
  TYPE_TRIGGER,
  TYPE_ACTIVITY,
  TYPE_UNKNOWN,
  // SCHEMA_FILE_NAME_TRIGGER,
  // SCHEMA_FILE_NAME_ACTIVITY
  // DEFAULT_SCHEMA_ROOT_FOLDER_NAME
} from '../../common/constants';
import { config } from '../../config/app-config';
import _ from 'lodash';
import url from 'url';
import https from 'https';
import http from 'http';
import { BaseRegistered } from '../../modules/base-registered';

// TODO support more git format
//  for the moment
//    https://github.com/:username/:projectname.git
//    https://github.com/:username/:projectname
const GITHUB_URL_PATTERN = /^(?:https\:\/\/)?github\.com\/(?:([\w\-]+)\/)(?:([\w\-]+)(?:\.git)?)$/.source;
const GITHUB_URL_SUBFOLDER_PATTERN = /^(?:https\:\/\/)?github\.com\/(?:([\w\-]+)\/)(?:([\w\-]+))\/(?:([\w\-/]+))$/.source;

// TODO
// update this information. the `somefile.json` and `aFloder` are only for testing.
// should use the imported ones from constants.
const SCHEMA_FILE_NAME_TRIGGER = 'somefile.json';
const SCHEMA_FILE_NAME_ACTIVITY = 'somefile.json';
const DEFAULT_SCHEMA_ROOT_FOLDER_NAME = 'aFolder';

/*
 * Utility functions to be extracted to utility module.
 * TODO
 */

function isGitHubURL( url ) {
  let simplePattern = new RegExp( GITHUB_URL_PATTERN );
  let subfolderPattern = new RegExp( GITHUB_URL_SUBFOLDER_PATTERN );
  return simplePattern.test( url ) || subfolderPattern.test( url );
}

function parseGitHubURL( url ) {
  let simplePattern = new RegExp( GITHUB_URL_PATTERN );
  let subfolderPattern = new RegExp( GITHUB_URL_SUBFOLDER_PATTERN );
  let result = null;

  let parsed = url.match( simplePattern );

  if ( parsed ) {
    result = {
      url : url,
      username : parsed[ 1 ],
      repoName : parsed[ 2 ]
    }
  } else {
    parsed = url.match( subfolderPattern );

    if ( parsed ) {
      result = {
        url : url,
        username : parsed[ 1 ],
        repoName : parsed[ 2 ],
        extraPath : parsed[ 3 ]
      }
    }
  }

  return result;
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
          installPromise = installActivityFromGitHub( sourceURLs );
          break;
        case TYPE_TRIGGER:
          installPromise = installTriggerFromGitHub( sourceURLs );
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

function installTriggerFromGitHub( sourceURLs ) {

  return Promise.all( _.map( sourceURLs, ( sourceURL ) => {
    let githubInfo = parseGitHubURL( sourceURL );

    return Promise.all(
      [ getPackageJSONFromGitHub( githubInfo ), getSchemaJSONFromGitHub( githubInfo, SCHEMA_FILE_NAME_TRIGGER ) ] )
      .then( ( results ) => {
        return {
          package : results[ 0 ],
          schema : results[ 1 ]
        }
      } );
  } ) )
    .then( ( results ) => {

      // TODO
      //  create trigger items.
      //  save  trigger items to the database.

      _.each( results, ( result, idx )=> {
        console.log( '------- ------- -------' );
        console.log( `Install Trigger | result | ${ sourceURLs[ idx ] }` );
        __insp( result );
        console.log( '------- ------- -------' );
      } );

      return true;

    } );
}

function installActivityFromGitHub( sourceURLs ) {

  return Promise.all( _.map( sourceURLs, ( sourceURL ) => {
    let githubInfo = parseGitHubURL( sourceURL );

    return Promise.all(
      [ getPackageJSONFromGitHub( githubInfo ), getSchemaJSONFromGitHub( githubInfo, SCHEMA_FILE_NAME_ACTIVITY ) ] )
      .then( ( results ) => {
        return {
          path : constructGitHubPath( githubInfo ),
          package : results[ 0 ],
          schema : results[ 1 ]
        }
      } );
  } ) )
    .then( ( results ) => {

      // TODO
      //  create activity items.
      //  save  activity items to the database.

      _.each( results, ( result, idx )=> {
        console.log( '------- ------- -------' );
        console.log( `Install Activity | result | ${ sourceURLs[ idx ] }` );
        __insp( result );
        console.log( '------- ------- -------' );
      } );

      return true;

    } );
}

/**
 * Construct GitHub file URI using the download URL format.
 *
 * https://raw.githubusercontent.com/:username/:repoName/[:branchName | :commitHash]/:filename
 *
 * @param githubInfo {Object} `username`, `repoName`, `branchName`, `commitHash`
 * @param fileName {String} Name of the file.
 * @returns {string} The file URI to retrieve the raw data of the file.
 */
function constructGitHubFileURI( githubInfo, fileName ) {
  let commitish = githubInfo.commitHash || githubInfo.branchName || 'master';
  let extraPath = githubInfo.extraPath ? `/${ githubInfo.extraPath }` : '';

  return `https://raw.githubusercontent.com/${ githubInfo.username }/${ githubInfo.repoName }/${ commitish }${ extraPath }/${ fileName }`;
}

function constructGitHubPath( githubInfo ) {
  let extraPath = githubInfo.extraPath ? `/${ githubInfo.extraPath }` : '';
  return `github.com/${ githubInfo.username }/${ githubInfo.repoName }${ extraPath }`;
}

// retrieve file data
function getRemoteFile( fileURI ) {
  return new Promise( ( resolve, reject ) => {
    let urlInfo = url.parse( fileURI );

    let reqSender = urlInfo.protocol === 'https:' ? https.request : http.request;

    let fileReq = reqSender( _.assign( urlInfo, {
      headers : {
        'Accept' : 'application/json',
        'Accept-Charset' : 'utf-8'
      }
    } ), ( fileRes )=> {
      let body = '';

      fileRes.setEncoding( 'utf8' );

      fileRes.on( 'data', ( chunk ) => {
        body += chunk;
      } );

      fileRes.on( 'end', () => {
        if ( fileRes.statusCode !== 200 ) {
          reject( {
            body : body,
            res : fileRes
          } );
        } else {
          resolve( body );
        }
      } );

      fileRes.on( 'error', reject );
    } );

    fileReq.on( 'error', reject );
    fileReq.end();
  } );
}

// get JSOM from remote
function getRemoteJSON( fileURI ) {
  return getRemoteFile( fileURI )
    .then( ( fileContent )=> {
      let fileJSON;
      try {
        fileJSON = JSON.parse( fileContent );
      } catch ( e ) {
        console.warn( `File parse error: ${fileURI}` );
        console.warn( e );
        // fallback to empty JSON when on parse file error.
        fileJSON = {};
      }

      return fileJSON;
    } )
    .catch( ( err )=> {
      if ( _.get( err, 'res.statusCode' ) === 404 ) {
        // cannot find the file
        return null;
      } else {
        throw err;
      }
    } );
}

// shorthand funtion to get `package.json`
function getPackageJSONFromGitHub( githubInfo ) {
  // construct the URI of package.json
  let fileURI = constructGitHubFileURI( githubInfo, `${DEFAULT_SCHEMA_ROOT_FOLDER_NAME}/package.json` );

  // get the remote JSON.
  return getRemoteJSON( fileURI );
}

// shorthand function to get the schema.json
function getSchemaJSONFromGitHub( githubInfo, schemaFileName ) {
  // construct the URI of the schema file
  let fileURI = constructGitHubFileURI( githubInfo, `${DEFAULT_SCHEMA_ROOT_FOLDER_NAME}/${schemaFileName}` );

  // get the remote JSON.
  return getRemoteJSON( fileURI );
}

// ------- ------- -------
// debugging inspector utility
function __insp( obj ) {
  'use strict';
  console.log( require( 'util' )
    .inspect( obj, { depth : 7, colors : true } ) );
}
