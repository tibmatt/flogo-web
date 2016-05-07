import path from 'path';
import fs from 'fs';
import performanceNow from "performance-now";
import _ from 'lodash';

export function btoa(str) {
  var buffer;

  if (str instanceof Buffer) {
    buffer = str;
  } else {
    buffer = new Buffer(str.toString(), 'binary');
  }

  return buffer.toString('base64');
}

export function atob(str) {
  return new Buffer(str, 'base64').toString('binary');
}

export function isExisted(testedPath){
  try {
    fs.accessSync(testedPath, fs.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

export function isDirectory(testedPath){
  if(isExisted(testedPath)){
    let stats = fs.statSync(testedPath);
    if(stats.isDirectory()){
      return true
    }else{
      return false;
    }
  }else{
    return undefined;
  }
}

export function readDirectoriesSync(dirPath){
  let dirs = fs.readdirSync(dirPath);
  let nDirs = [];
  dirs.forEach((dir)=>{
    if(isDirectory(path.join(dirPath, dir))){
      nDirs.push(dir);
    }
  });

  return nDirs;
}

/**
 * judge whether a string is a valid json string. if i
 * @param  {string}  str - the JSON string
 * @return {object|undefined} if it is a valid json, return json, otherwise return undefined
 */
export function isJSON(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return undefined;
  }
}

/**
 * Read a JSON file
 * @param  {string|Path} jSONPath - the path of JSON file
 * @return {object|undefined} if it is a valid and exist json, return json, otherwise return undefined
 */
export function readJSONFileSync(JSONPath){
  let data = undefined;
  if(isExisted(JSONPath)){
    data = fs.readFileSync(JSONPath, {
      "encoding": "utf8"
    });
    data = isJSON(data);
  }else{
    console.error("[error][utils.js->readJSONFileSync] path doesn't exist. path: ", JSONPath);
  }

  return data;
}

/**
 * write a JSON file
 * @param {string|Path} JSONPath - the path of JSON file
 * @param {object} data - the JSON data you want to write
 * @return {boolean} if write successful, return ture, otherwise return false
 */
export function writeJSONFileSync(JSONPath, data){
  try{
    fs.writeFileSync(JSONPath, JSON.stringify(data, null, 2), {
      "encoding": "utf8"
    });
    return true;
  }catch(err){
    console.error("[error][utils.js->writeJSONFileSync] err: ", err);
    return false;
  }
}

export function flogoIDEncode( id){
  return btoa( id )
    .replace( /\+/g, '-' )
    .replace( /\//g, '_' )
    .replace( /=+$/, '' );
}

// URL safe base64 decoding
// reference: https://gist.github.com/jhurliman/1250118
export function flogoIDDecode( encodedId ){

  encodedId = encodedId.replace( /-/g, '+' )
    .replace( /_/g, '/' );

  while ( encodedId.length % 4 ) {
    encodedId += '=';
  }

  return atob( encodedId );
}

export function flogoGenTaskID() {
  // shift the timestamp for avoiding overflow 32 bit system
  // TODO
  //  generate a more meaningful task ID in string format
  return flogoIDEncode( '' + (Date.now() >>> 1) );
}

export function genNodeID()  {
  let id = '';

  if ( performanceNow && _.isFunction( performanceNow ) ) {
    id = `FlogoFlowDiagramNode::${Date.now()}::${performanceNow()}`;
  } else {
    id = `FlogoFlowDiagramNode::${Date.now()}}`;
  }

  return flogoIDEncode( id );
};

/**
 * Convert task ID to integer, which is the currently supported type in engine
 * TODO
 *  taskID should be string in the future, perhaps..
 *
 * @param taskID
 * @returns {number}
 * @private
 */
export function convertTaskID(taskID ) {
  let id = '';

  try {
    id = flogoIDDecode( taskID );

    // get the timestamp
    let parsedID = id.split( '::' );

    if ( parsedID.length >= 2 ) {
      id = parsedID[ 1 ];
    }
  } catch ( e ) {
    console.warn( e );
    id = taskID;
  }

  return parseInt( id );
}
