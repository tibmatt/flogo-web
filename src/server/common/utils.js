import path from 'path';
import fs from 'fs';
import btoa from 'btoa';
import performanceNow from "performance-now";
import _ from 'lodash';

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

export function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
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
