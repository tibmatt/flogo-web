import {
  TYPE_TRIGGER,
  TYPE_ACTIVITY,
  TYPE_UNKNOWN,
  DEFAULT_SCHEMA_ROOT_FOLDER_NAME,
  SCHEMA_FILE_NAME_ACTIVITY,
  SCHEMA_FILE_NAME_TRIGGER
} from '../../common/constants';
import { activitiesDBService, triggersDBService, config } from '../../config/app-config';
import _ from 'lodash';
import path from 'path';
import { BaseRegistered } from '../../modules/base-registered';
import {
  readJSONFileSync,
  isGitHubURL,
  parseGitHubURL,
  constructGitHubPath,
  constructGitHubRepoURL,
  isInGitHubRepo,
  runShellCMD
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

  constructor( opts ) {
    const defaultOpts = {
      type : TYPE_UNKNOWN,
      gitRepoCachePath : config.app.gitRepoCachePath, // location to cache the git repos.
      registerPath : path.join( config.rootPath, `packages/defaults` ), // location to install the node packages. Will run `npm insatll` under it.
      schemaRootFolderName : DEFAULT_SCHEMA_ROOT_FOLDER_NAME
    };

    this.opts = _.assign( {}, defaultOpts, opts );
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
      console.log( '[log] Install from GitHub' );
      console.log( sourceURLs );

      let installPromise = null;
      let opts = _.assign( { sourceURLs }, this.opts );

      switch ( opts.type ) {
        case TYPE_ACTIVITY:
          installPromise = installActivityFromGitHub( opts );
          break;
        case TYPE_TRIGGER:
          installPromise = installTriggerFromGitHub( opts );
          break;
        default:
          throw new Error( 'Unknown Type' );
          break;
      }

      return installPromise.then( ( result )=> {
        console.log( '[log] Installed' );
        return result;
      } )
        .then( resolve )
        .catch( reject );

    } );
  }

  // TODO
  defaultInstall( sourceURLs ) {
    return new Promise( ( resolve, reject )=> {
      console.log( '[TODO] Default installation' );

      resolve( _.reduce( sourceURLs, ( installResult, url ) => {
        console.warn( `[TODO defaultInstall] Try to install [${ url }]..` );
        installResult.fail.push( url );
        return installResult;
      }, {
        success : [],
        fail : []
      } ) );
    } );
  }
}

// ------- ------- -------
// utility functions

// install item from GitHub
function installFromGitHub( opts ) {

  // const opts = {
  //   sourceURLs, schemaFileName, dbService, type
  // };

  const repoDownloader = new GitHubRepoDownloader( {
    type : opts.type,
    cacheFolder : opts.gitRepoCachePath
  } );

  return repoDownloader.download(
    _.map( opts.sourceURLs, sourceURL => constructGitHubRepoURL( parseGitHubURL( sourceURL ) ) ) )
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
      return _.reduce( opts.sourceURLs, ( dlResult, sourceURL ) => {

        let repoPath = '';
        const githubInfo = parseGitHubURL( sourceURL );
        const item = {
          path : constructGitHubPath( githubInfo ),
          sourceURL : sourceURL,
          package : '', // package.json, to be added later
          schema : '', // schema.json, activity.json or trigger.json, to be added later
          downloaded : false,
          installed : false,
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
          const packageJSONPath = path.join( repoPath, extraPath, opts.schemaRootFolderName,
            'package.json' );
          const schemaJSONPath = path.join( repoPath, extraPath, opts.schemaRootFolderName,
            opts.schemaFileName );

          try {
            // console.error( `[log] reading ${packageJSONPath}` );
            item.package = readJSONFileSync( packageJSONPath );
          } catch ( e ) {
            console.error( `[error] reading ${packageJSONPath}: ` );
            console.error( e );
          }

          try {
            // console.error( `[log] reading ${schemaJSONPath}` );
            item.schema = readJSONFileSync( schemaJSONPath );

            // at this step, should be save to mark the item has been downloaded.
            item.downloaded = true;
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

    // install the given items using `npm` commands to the registered modules folder
    .then( items => {
      return sequentiallyInstall( items, {
        registerPath : opts.registerPath,
        // repo root folder including git repo cache root + type folder
        repoRoot : path.join( opts.gitRepoCachePath, opts.type.toLocaleLowerCase() ),
        schemaRootFolderName : opts.schemaRootFolderName
      } );
    } )

    // update installation results in items.
    .then( installedResult => {

      return _.map( installedResult.items, ( item, idx ) => {
        item.raw.installed = installedResult.results[ idx ];
        return item;
      } );

    } )

    // save items to db
    .then( items => {

      // construct items for saving
      //    1. filter null items
      //    2. create a map
      let itemsToSave = _.reduce( items, ( itemDict, item ) => {

        // only save the item has dbItem configuration and installed into the server's activity/trigger repo
        if ( !_.isNil( item.dbItem ) && item.raw.installed ) {
          itemDict[ item.dbItem[ '_id' ] ] = item.dbItem;
          item.raw.savedToDB = true;
        }

        return itemDict;
      }, {} );

      return BaseRegistered.saveItems( opts.dbService, itemsToSave, true )
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
function installTriggerFromGitHub( opts ) {

  return installFromGitHub( _.assign( {
    schemaFileName : SCHEMA_FILE_NAME_TRIGGER,
    dbService : triggersDBService,
    type : TYPE_TRIGGER
  }, opts ) );
}

// shorthand function to install activities from GitHub
function installActivityFromGitHub( opts ) {

  return installFromGitHub( _.assign( {
    schemaFileName : SCHEMA_FILE_NAME_ACTIVITY,
    dbService : activitiesDBService,
    type : TYPE_ACTIVITY
  }, opts ) );
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
/**
 * Install the items sequentially using `npm install` command,
 *
 * Will resolve with the items passed into it, after job done.
 * {
 *  items: items,
 *  result: installationResult
 * }
 *
 * @param items
 * @param opts
 * @returns {Promise}
 */
function sequentiallyInstall( items, opts ) {

  return new Promise( ( resolve, reject )=> {

    let processedItemNum = 0;
    let installedResult = [];

    function _sequentiallyInstall() {

      let item = items[ processedItemNum ];

      if ( _.isNil( item ) ) {
        throw new Error( `[error] cannot install item ${ processedItemNum } of ${ items }` );
      }

      let githubInfo = parseGitHubURL( item.raw.sourceURL );
      let packagePath = path.join( opts.repoRoot, githubInfo.username, githubInfo.repoName,
        githubInfo.extraPath, opts.schemaRootFolderName );

      processedItemNum++;

      let promise = null;

      // if the repo is available, run `npm install` command for it.
      if ( item.raw.downloaded ) {
        promise = runShellCMD( 'npm', [ 'i', '-S', packagePath ], { cwd : opts.registerPath } );
      } else {
        promise = Promise.resolve( false );
      }

      return promise.then( ( result )=> {
        if ( result !== false && !_.isNil( result ) ) {
          installedResult.push( true );
        } else {
          installedResult.push( false );
        }

        if ( processedItemNum >= items.length ) {
          resolve( {
            items,
            results : installedResult
          } );
        } else {
          return _sequentiallyInstall();
        }
      } );
    }

    _sequentiallyInstall()
      .catch( ( err )=> {
        console.log( `[TODO] sequentiallyInstall on error: ` );
        console.error( err );
        reject( err );
      } )

  } )
}
