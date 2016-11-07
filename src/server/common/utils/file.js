import path from 'path';
import fs from 'fs';

import {runShellCMD} from '../utils';

export function isDirectory( testedPath ) {
  if ( fileExists( testedPath ) ) {
    let stats = fs.statSync( testedPath );
    if ( stats.isDirectory() ) {
      return true
    } else {
      return false;
    }
  } else {
    return undefined;
  }
}

export function readDirectoriesSync( dirPath ) {
  let dirs = fs.readdirSync( dirPath );
  let nDirs = [];
  dirs.forEach( ( dir )=> {
    if ( isDirectory( path.join( dirPath, dir ) ) ) {
      nDirs.push( dir );
    }
  } );

  return nDirs;
}

/**
 * Read a JSON file
 * @param  {string|Path} jSONPath - the path of JSON file
 * @return {object|undefined} if it is a valid and exist json, return json, otherwise return undefined
 */
export function readJSONFileSync( JSONPath ) {
  let data = undefined;
  if ( fileExists( JSONPath ) ) {
    data = fs.readFileSync( JSONPath, {
      "encoding" : "utf8"
    } );
    data = isJSON( data );
  } else {
    console.error( "[error][utils.js->readJSONFileSync] path doesn't exist. path: ", JSONPath );
  }

  return data;
}

/**
 * Async version of readJSONFileSync
 * @param  {string|Path} jSONPath - the path of JSON file
 * @return {Promise<object|undefined>} if it is a valid and exist json, return json, otherwise return undefined
 */
export function readJSONFile( JSONPath ) {
  return new Promise( ( resolve, reject ) => {
    if ( fileExists( JSONPath ) ) {
      fs.readFile( JSONPath, { 'encoding' : 'utf8' }, ( err, data )=> {
        if ( err ) {
          reject( err );
        } else {
          resolve( isJSON( data ) );
        }
      } );
    } else {
      console.error( "[error][utils.js->readJSONFile] path doesn't exist. path: ", JSONPath );
      throw new Error( `Path [${JSONPath}] doesn't exist.` );
    }
  } );
}

/**
 * Get absoulte path to latest file in a directory. It does not recurse.
 * @param where directory to look in
 * @param name {string|RegExp} name of the file
 * @returns {Promise<String>} resolves to absolute path to file or null if no file found with the provided name
 */
export function findLastCreatedFile(where, name) {

  if (typeof name === 'string') {
    name = new RegExp(name);
  }

  return new Promise((resolve, reject) => {
    fs.readdir(where, function (err, files) {
      if(err) {
        return reject(err);
      }

      let fileStatsCollect = files.
      filter(fileName => name.test(fileName))
        .map(fileName => new Promise((resolve, reject) => {
          let filePath = path.join(where, fileName);
          fs.stat(filePath, (err, stats) => resolve(err ? null : {path: filePath, creation: stats.birthtime.getTime()}));
        }));

      Promise.all(fileStatsCollect)
        .then(files => files.reduce((greatest, current) => current.creation > greatest.creation ? current : greatest, {creation: 0}))
        .then(fileInfo => fileInfo.path || null)
        .then(resolve)

    })
  });

}

/**
 * write a JSON file
 * @param {string|Path} JSONPath - the path of JSON file
 * @param {object} data - the JSON data you want to write
 * @return {boolean} if write successful, return ture, otherwise return false
 */
export function writeJSONFileSync( JSONPath, data ) {
  try {
    fs.writeFileSync( JSONPath, JSON.stringify( data, null, 2 ), {
      "encoding" : "utf8"
    } );
    return true;
  } catch ( err ) {
    console.error( "[error][utils.js->writeJSONFileSync] err: ", err );
    return false;
  }
}

/**
 * Async version of writeJSONFileSync
 * @param {string|Path} JSONPath - the path of JSON file
 * @param {object} data - the JSON data you want to write
 * @return {Promise<boolean>} if write successful, return true, otherwise return false
 */
export function writeJSONFile( JSONPath, data ) {
  return new Promise( ( resolve, reject ) => {
    fs.writeFile( JSONPath, JSON.stringify( data, null, 2 ), { 'encoding' : 'utf8' }, ( err )=> {
      if ( err ) {
        reject( err );
      } else {
        resolve( true );
      }
    } );
  } );
}

/**
 * Create the given folder using `mkdir` command
 * TODO: cross platform support?
 * @param folderPath
 * @returns {Promise}
 */
export function createFolder( folderPath ) {
  return new Promise( ( resolve, reject )=> {
    runShellCMD( 'mkdir', [ '-p', folderPath ] )
      .then( ()=> {
        resolve( true );
      } )
      .catch( ( err )=> {
        reject( err );
      } );
  } );
}

/**
 * Remove the given folder using `rm -rf`
 * TODO: cross platform support?
 * @param folderPath
 * @returns {Promise}
 */
export function rmFolder( folderPath ) {
  return new Promise( ( resolve, reject )=> {
    runShellCMD( 'rm', [ '-rf', folderPath ] )
      .then( ()=> {
        resolve( true );
      } )
      .catch( ( err )=> {
        reject( err );
      } );
  } );
}

export function fileExists(testedPath ) {
  try {
    fs.accessSync( testedPath, fs.F_OK );
    return true;
  } catch ( e ) {
    return false;
  }
}

