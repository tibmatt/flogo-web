import { FLOGO_TASK_TYPE, FLOGO_TASK_ATTRIBUTE_TYPE } from './constants';

// URL safe base64 encoding
// reference: https://gist.github.com/jhurliman/1250118
export function flogoIDEncode( id : string ) : string {
  return btoa( id )
    .replace( /\+/g, '-' )
    .replace( /\//g, '_' )
    .replace( /=+$/, '' );
}

// URL safe base64 decoding
// reference: https://gist.github.com/jhurliman/1250118
export function flogoIDDecode( encodedId : string ) : string {

  encodedId = encodedId.replace( /-/g, '+' )
    .replace( /_/g, '/' );

  while ( encodedId.length % 4 ) {
    encodedId += '=';
  }

  return atob( encodedId );
}

export function flogoGenTaskID() : string {
  // shift the timestamp for avoiding overflow 32 bit system
  // TODO
  //  generate a more meaningful task ID in string format
  return flogoIDEncode( '' + (Date.now() >>> 1) );
}

// mapping from schema.json of activity to the task can be used in flow.json
export function activitySchemaToTask(schema: any) : any {

  let task:any = {
    type: FLOGO_TASK_TYPE.TASK,
    activityType: _.get(schema, 'name', ''),
    name: _.get(schema, 'title', _.get(schema, 'name', 'Activity')),
    version: _.get(schema, 'version', ''),
    title: _.get(schema, 'title', ''),
    description: _.get(schema, 'description', ''),
    attributes: {
      inputs: _.get(schema, 'inputs', []),
      outputs: _.get(schema, 'outputs', [])
    }
  };

  // TODO
  //  mock for demo2
  //    adding mapping information for pet query tasks
  if ( task.activityType === 'rest' ) {
    _.assign(
      task, {
        "inputMappings" : [
          {
            "type" : 1,
            "value" : "petId",
            "mapTo" : "petId"
          }
        ],
        "outputMappings" : [
          {
            "type" : 1,
            "value" : "result",
            "mapTo" : "petInfo"
          }
        ]
      }
    );
  }

  _.each(
    task.attributes.inputs, ( input : any ) => {
      // convert to task enumeration and provision default types
      input.type = _.get(FLOGO_TASK_ATTRIBUTE_TYPE, _.get(input, 'type', 'STRING').toUpperCase(), FLOGO_TASK_ATTRIBUTE_TYPE.STRING);
    }
  );

  _.each(
    task.attributes.outputs, ( output : any ) => {
      // convert to task enumeration and provision default types
      output.type = _.get(FLOGO_TASK_ATTRIBUTE_TYPE, _.get(output, 'type', 'STRING').toUpperCase(), FLOGO_TASK_ATTRIBUTE_TYPE.STRING);
    }
  );

  return task;
}


// Create a svg element for line of branch
export function branchLine(height: number, state?: boolean) {
  let path1 = ['M33',16,'L3.55252287e-15',16, 'L0.00429665299',104.882392, 'C0.00509736356',121.446231, 13.4334279, 134.881117, 29.9973119,134.881118, 'L95', 134.881119, 'L95', 103.126919, 'L43.0031989', 103.126919, 'C37.4785847', 103.126919, 33,98.6492943, 33,93.1237817, 'L33', 16];
  let path2 = ['M95', 135.118308, 'L103.999517', 118.557306, 'L95', 103, 'L95', 135.118308];
  let path3 = ['M3.55271368e-15', 0, 'L33', 0, 'L33', 16, 'L3.55271368e-15', 16, 'L3.55271368e-15', 0];

  let formatPath = function(path: any) {
    let pathString = '';
    for(let i = 0; i < path.length; i++) {
      if(i%2) {
        pathString += path[i]+' ';
      } else {
        pathString += path[i] + ',';
      }
    }
    pathString += 'Z';
    return pathString;
  };

  let modifyYAxis = function(path, height) {
    height -= 141;
    for(let i = 0; i < path.length; i++) {
      if(i%2 && path[i] != 0) {
        path[i] += height;
      }
    }
    return path;
  };

  path1 = modifyYAxis(path1, height);
  path2 = modifyYAxis(path2, height);
  path3 = modifyYAxis(path3, height);

  let svgEle: string;
  let dPath: string;

  dPath = formatPath(path1) + ' ' + formatPath(path2) + ' ' + formatPath(path3);
  if(state) {
    svgEle = `
    <svg width="110px" height="${height+5}px" viewBox="0 0 110 ${height+5}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
            <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="filter-1">
                <feOffset dx="0" dy="1" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
                <feGaussianBlur stdDeviation="1.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
                <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.14 0" in="shadowBlurOuter1" type="matrix" result="shadowMatrixOuter1"></feColorMatrix>
                <feMerge>
                    <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
                    <feMergeNode in="SourceGraphic"></feMergeNode>
                </feMerge>
            </filter>
            <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="filter-2">
                <feOffset dx="0" dy="5" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
                <feGaussianBlur stdDeviation="7" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
                <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.228122169 0" in="shadowBlurOuter1" type="matrix" result="shadowMatrixOuter1"></feColorMatrix>
                <feMerge>
                    <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
                    <feMergeNode in="SourceGraphic"></feMergeNode>
                </feMerge>
            </filter>
        </defs>
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" filter="url(#filter-1)">
            <g fill="#8A90AE">
                <g transform="translate(5, 5)">
                    <g filter="url(#filter-2)">
                        <path d="${dPath}"></path>
                    </g>
                </g>
            </g>
        </g>
    </svg>
    `;
  } else {
    svgEle = `
    <svg width="110px" height="${height}px" viewBox="0 0 110 ${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
            <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="filter-1">
                <feOffset dx="0" dy="1" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
                <feGaussianBlur stdDeviation="1.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
                <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.14 0" in="shadowBlurOuter1" type="matrix" result="shadowMatrixOuter1"></feColorMatrix>
                <feMerge>
                    <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
                    <feMergeNode in="SourceGraphic"></feMergeNode>
                </feMerge>
            </filter>
            <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-2">
                <stop stop-color="#ABB0C5" offset="0%"></stop>
                <stop stop-color="#C2C5DA" offset="100%"></stop>
            </linearGradient>
        </defs>
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" filter="url(#filter-1)">
            <g fill="url(#linearGradient-2)">
                <path d="${dPath}" id="Combined-Shape"></path>
            </g>
        </g>
    </svg>
    `;
  }

  return svgEle;
}

export function sluggifyTaskName(taskName:string) {
  return _.kebabCase(taskName);
}
