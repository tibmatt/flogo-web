import {
  TYPE_TRIGGER,
  TYPE_ACTIVITY,
  TYPE_UNKNOWN,
  DEFAULT_SCHEMA_ROOT_FOLDER_NAME,
  SCHEMA_FILE_NAME_ACTIVITY,
  SCHEMA_FILE_NAME_TRIGGER
} from '../../common/constants';
import { config } from '../../config/app-config';
import _ from 'lodash';
import path from 'path';
import { BaseRegistered } from '../../modules/base-registered';
import {
  isGitHubURL,
  parseGitHubURL,
  constructGitHubPath
} from '../../common/utils';
import {getInitializedEngine} from "../engine/registry";
import {triggersDBService} from "../../common/db/triggers";
import {activitiesDBService} from "../../common/db/activities";
import {runShellCMD} from "../../common/utils/process";

// TODO
// update this information. the `somefile.json` and `aFloder` are only for testing.
// should use the imported ones from constants.
// const SCHEMA_FILE_NAME_TRIGGER = 'somefile.json';
// const SCHEMA_FILE_NAME_ACTIVITY = 'somefile.json';
// const DEFAULT_SCHEMA_ROOT_FOLDER_NAME = 'aFolder';

//TODO clean dead code

/**
 * Remote Installer class
 * Install activities and triggers from remote URL, currently only supports GitHub
 */
export class RemoteInstaller {

  constructor( opts ) {
    const defaultOpts = {
      type : TYPE_UNKNOWN,
      gitRepoCachePath : config.app.gitRepoCachePath, // location to cache the git repos.
      registerPath : path.join( config.rootPath, 'packages', 'defaults' ), // location to install the node packages. Will run `npm insatll` under it.
      schemaRootFolderName : DEFAULT_SCHEMA_ROOT_FOLDER_NAME
    };

    this.opts = _.assign( {}, defaultOpts, opts );
  }

  updateOptions(opts) {
    this.opts = _.assign( {}, this.opts, opts );
    return this;
  }

  install( sourceURLs, opts ) {
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

      this.installFromGitHub( parsedURLs.github, opts )
        .then( ( githubResult )=> {
          result.github = githubResult;

          return this.defaultInstall( parsedURLs.default );
        } )
        .then( ( defaultResult )=> {
          result.default = defaultResult;

          return result;
        } )
        .then((result) => ({
          success : _.union( result.github.success, result.default.success ),
          fail : _.union( result.github.fail, result.default.fail ),
          details : _.assign( {}, result.github.details, result.default.details )
        }))
        .then( resolve )
        .catch( ( err ) => {
          console.error( err );
          reject( err );
        });
    } );
  }

  installFromGitHub( sourceURLs, options ) {
    return new Promise( ( resolve, reject )=> {
      console.log( '[log] Install from GitHub' );
      console.log( sourceURLs );

      let installPromise = null;
      let opts = _.assign( { sourceURLs }, this.opts, options );

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

  let urls =  _.map( opts.sourceURLs, sourceURL => constructGitHubPath( parseGitHubURL( sourceURL ) ) );

  let getEngine = opts.engine ? Promise.resolve(opts.engine) : getInitializedEngine(config.defaultEngine.path);

  return getEngine
    .then(engine => {
      let installTask = __makeInstallProcess(engine);
      // install one after the other
      return urls.reduce((promise, url) => {
        return promise.then(() => installTask(url))
      }, Promise.resolve(true));

    });

  function __makeInstallProcess(engine) {

    let typeName = opts.type == TYPE_TRIGGER ? 'Trigger': 'Activity';
    return url => {
      let initPromise = Promise.resolve(true);
      if(engine[`has${typeName}`](url)) {
        initPromise = engine[`delete${typeName}`](url);
      }
      return initPromise.then(() => engine[`add${typeName}`](url, {version: 'latest'}));

    };
  }


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
      'ref' : rawItemInfo.path,
      'name' : m.name,
      'version' : m.version,
      'description' : m.description,
      'keywords' : m.keywords || [],
      'author' : m.author,
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
