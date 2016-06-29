import {
  TYPE_TRIGGER,
  TYPE_ACTIVITY,
  TYPE_UNKNOWN,
  DEFAULT_SCHEMA_ROOT_FOLDER_NAME,
  SCHEMA_FILE_NAME_ACTIVITY,
  SCHEMA_FILE_NAME_TRIGGER
} from '../../common/constants';
import { activitiesDBService, triggersDBService } from '../../config/app-config';
import _ from 'lodash';
import url from 'url';
import https from 'https';
import http from 'http';
import path from 'path';
import { BaseRegistered } from '../../modules/base-registered';
import {
  readJSONFileSync,
  isGitHubURL,
  parseGitHubURL,
  constructGitHubFileURI,
  constructGitHubPath,
  constructGitHubRepoURL,
  isInGitHubRepo
} from '../../common/utils';
import { GitHubRepoDownloader } from '../github-repo-downloader';

// TODO
// update this information. the `somefile.json` and `aFloder` are only for testing.
// should use the imported ones from constants.
// const SCHEMA_FILE_NAME_TRIGGER = 'somefile.json';
// const SCHEMA_FILE_NAME_ACTIVITY = 'somefile.json';
// const DEFAULT_SCHEMA_ROOT_FOLDER_NAME = 'aFolder';

/**
 * Remote Installer class
 * Install activities and triggers from remote URL, currently only supports GitHub
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
        .then( ( result ) => {

          // TODO
          //  need to merge and include the installed success ones and failed ones.


          return {
            success : _.union( result.github.success, result.default.success ),
            fail : _.union( result.github.fail, result.default.fail )
          };
        } )
        .then( resolve )
        .catch( ( err ) => {
          console.error( err );
          reject( err );
        } );
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

      return installPromise.then( ( result )=> {
        console.log( 'Installed' );
        console.log( '------- ------- -------' );
        return result;
      } )
        .then( resolve )
        .catch( reject );

    } );
  }

  // TODO
  defaultInstall( sourceURLs ) {
    return new Promise( ( resolve, reject )=> {
      console.log( '------- ------- -------' );
      console.log( 'Default installation [TODO]' );

      resolve( _.reduce( sourceURLs, ( installResult, url ) => {
        console.warn( `[TODO defaultInstall] Try to install [${ url }]..` );
        installResult.fail.push( url );
        return installResult;
      }, {
        success : [],
        fail : []
      } ) );

      console.log( '------- ------- -------' );
    } );
  }
}

// ------- ------- -------
// utility functions

// install item from GitHub
function installFromGitHub( sourceURLs, schemaFileName, dbService, type ) {

  const repoDownloader = new GitHubRepoDownloader( { type } );

  return repoDownloader.download(
    _.map( sourceURLs, sourceURL => constructGitHubRepoURL( parseGitHubURL( sourceURL ) ) ) )
    .then( ( result )=> {

      // console.log( `[TODO] download result: ` );
      // _.each( result, ( item )=> {
      //   let repoPath = path.join( repoDownloader.cacheTarget,
      //     GitHubRepoDownloader.getTargetPath( item.repo ) );
      //   console.log(
      //     `---> url: ${item.repo}\n${item.result || item.error}\n${repoPath}\n<---` );
      // } );

      // reduce the sourceURLs to a downloadResult
      // create raw data for further processing.
      return _.reduce( sourceURLs, ( dlResult, sourceURL ) => {

        let repoPath = '';
        const githubInfo = parseGitHubURL( sourceURL );
        const item = {
          path : constructGitHubPath( githubInfo ),
          sourceURL : sourceURL,
          package : '', // package.json, to be added later
          schema : '', // schema.json, activity.json or trigger.json, to be added later
          savedToDB : false
        };

        // check if the given sourceURL belongs to a successfully downloaded repo
        const isAvailable = _.some( result, ( item ) => {
          if ( isInGitHubRepo( item.repo, sourceURL ) && !item.error ) {
            repoPath = path.join( repoDownloader.cacheTarget,
              GitHubRepoDownloader.getTargetPath( item.repo ) );

            return true;
          }

          return false;
        } );

        // get package.json && schema.json
        if ( isAvailable && repoPath ) {
          const extraPath = githubInfo.extraPath || '';
          const packageJSONPath = path.join( repoPath, extraPath, DEFAULT_SCHEMA_ROOT_FOLDER_NAME,
            'package.json' );
          const schemaJSONPath = path.join( repoPath, extraPath, DEFAULT_SCHEMA_ROOT_FOLDER_NAME,
            schemaFileName );

          try {
            console.error( `[log] reading ${packageJSONPath}` );
            item.package = readJSONFileSync( packageJSONPath );
          } catch ( e ) {
            console.error( `[error] reading ${packageJSONPath}: ` );
            console.error( e );
          }

          try {
            console.error( `[log] reading ${schemaJSONPath}` );
            item.schema = readJSONFileSync( schemaJSONPath );
          } catch ( e ) {
            console.error( `[error] reading ${schemaJSONPath}: ` );
            console.error( e );
          }
        }

        dlResult.push( item );

        return dlResult;
      }, [] );
    } )

    // process raw items
    .then( rawItems => {
      return _.map( rawItems, rawItem => {
        return {
          raw : rawItem,
          dbItem : processItemFromGitHub( rawItem )
        };
      } );
    } )

    // save items to db
    .then( items => {

      // construct items for saving
      //    1. filter null items
      //    2. create a map
      let itemsToSave = _.reduce( items, ( itemDict, item ) => {

        if ( !_.isNil( item.dbItem ) ) {
          itemDict[ item.dbItem[ '_id' ] ] = item.dbItem;
          item.raw.savedToDB = true;
        }

        return itemDict;
      }, {} );

      return BaseRegistered.saveItems( dbService, itemsToSave, true )
        .then( ( result ) => {
          return {
            saveResult : result,
            items
          }
        } );
    } )

    // finally return ture once finished.
    .then( result => {
      return _.reduce( result.items, ( installResult, item ) => {

        if ( item.raw.savedToDB && result.saveResult === true ) {
          installResult.success.push( item.raw.sourceURL );
        } else {
          installResult.fail.push( item.raw.sourceURL );
        }

        return installResult;
      }, {
        success : [],
        fail : []
      } );
    } )
    .catch( ( err )=> {
      console.log( `[error] error on installFromGitHub` );
      throw err;
    } );
}

// shorthand function to install triggers from GitHub
function installTriggerFromGitHub( sourceURLs ) {

  return installFromGitHub( sourceURLs, SCHEMA_FILE_NAME_TRIGGER, triggersDBService, TYPE_TRIGGER );
}

// shorthand function to install activities from GitHub
function installActivityFromGitHub( sourceURLs ) {

  return installFromGitHub( sourceURLs, SCHEMA_FILE_NAME_ACTIVITY, activitiesDBService, TYPE_ACTIVITY );
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
        console.warn( `[WARN] 404: ${fileURI}` );
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

function processItemFromGitHub( rawItemInfo ) {
  let itemInfo = null;

  if ( rawItemInfo.path && rawItemInfo.package && rawItemInfo.schema ) {
    let p = rawItemInfo.package;
    let s = rawItemInfo.schema;

    // merge the schema and package information together
    // so that the name/version/description information can be overridden.
    let m = _.assign( {}, p, s );

    itemInfo = BaseRegistered.constructItem( {
      'id' : BaseRegistered.generateID( m.name, m.version ),
      'where' : rawItemInfo.path,
      'name' : m.name,
      'version' : m.version,
      'description' : m.description,
      'keywords' : m.keywords || [],
      'schema' : s
    } );
  }

  return itemInfo;
}

// ------- ------- -------
// debugging inspector utility
function __insp( obj ) {
  'use strict';
  console.log( require( 'util' )
    .inspect( obj, { depth : 7, colors : true } ) );
}
