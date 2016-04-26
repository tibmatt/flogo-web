import { FLOGO_TASK_TYPE, FLOGO_TASK_ATTRIBUTE_TYPE, DEFAULT_VALUES_OF_TYPES } from './constants';

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

/**
 * Convert task ID to integer, which is the currently supported type in engine
 * TODO
 *  taskID should be string in the future, perhaps..
 *
 * @param taskID
 * @returns {number}
 * @private
 */
export function convertTaskID(taskID : string ) {
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

// get default value of a given type
export function getDefaultValue( type : FLOGO_TASK_ATTRIBUTE_TYPE ) : any {
  return DEFAULT_VALUES_OF_TYPES[ type ];
}

// convert the type of attribute and add default value if enabled
function portAttribute( inAttr : {
  type : string;
  value : any;
  [key : string] : any;
}, withDefault = false ) {

  let outAttr = <{
    type : FLOGO_TASK_ATTRIBUTE_TYPE;
    value : any;
    [key : string] : any;
  }>_.assign( {}, inAttr );

  outAttr.type = <FLOGO_TASK_ATTRIBUTE_TYPE>_.get( FLOGO_TASK_ATTRIBUTE_TYPE,
    _.get( outAttr, 'type', 'STRING' )
      .toUpperCase() );

  if ( withDefault && _.isUndefined( outAttr.value ) ) {
    outAttr.value = getDefaultValue( outAttr.type );
  }

  return outAttr;
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

  _.each(
    task.attributes.inputs, ( input : any ) => {
      // convert to task enumeration and provision default types
      _.assign( input, portAttribute( input, true ) );
    }
  );

  _.each(
    task.attributes.outputs, ( output : any ) => {
      // convert to task enumeration and provision default types
      _.assign( output, portAttribute( output ) );
    }
  );

  return task;
}

// mapping from schema.json of activity to the trigger can be used in flow.json
export function activitySchemaToTrigger(schema: any) : any {

  let trigger:any = {
    type: FLOGO_TASK_TYPE.TASK_ROOT,
    activityType: _.get(schema, 'name', ''),
    name: _.get(schema, 'title', _.get(schema, 'name', 'Activity')),
    version: _.get(schema, 'version', ''),
    title: _.get(schema, 'title', ''),
    description: _.get(schema, 'description', ''),
    settings: _.get(schema, 'settings', ''),
    outputs: _.get(schema, 'outputs', ''),
    endpoint: { settings: _.get(schema, 'endpoint.settings', '') }
  };

  _.each(
    trigger.inputs, ( input : any ) => {
      // convert to task enumeration and provision default types
      _.assign( input, portAttribute( input, true ) );
    }
  );

  _.each(
    trigger.outputs, ( output : any ) => {
      // convert to task enumeration and provision default types
      _.assign( output, portAttribute( output ) );
    }
  );


  return trigger;
}

export function genBranchArrow( opts? : any ) : string {

  // --- sample path info ---

  // M0,0        // the start point
  // L0,71       // the left vertical boundary

  // // outer curve
  // C0.00407789085,84.2639443 10.7467423,94.999999 24,95

  // L76,95      // the bottom boundary
  // L83,82.5    // the right most point
  // L76,70      // the right point of the middle horizontal line
  // L34,70      // the left point of the middle horizontal line

  // // inner curve
  // C29.9779086,69.6246589 26.4,66.0465096 26,62

  // L26,0       // the top right point of the shape

  // Z

  // default opts
  let svgSize = [
    _.get( opts, 'svgWidth', 87 ),
    _.get( opts, 'svgHeight', 100 )
  ];
  let barWidth = _.get( opts, 'barSize', 26 );
  let translateCo = _.get( opts, 'translate', [ 2, 2 ] );
  let padding = _.get( opts, 'padding', {
    bottom : 3,
    right : 2
  } );

  let imgSize = [
    svgSize[ 0 ] - translateCo[ 0 ] - padding.right,
    svgSize[ 1 ] - translateCo[ 1 ] - padding.bottom
  ];

  // the factor to calculate the height of the triangle shape, to the right most point
  let triangleHeightFactor = 7 / 12.5;
  let halfBaseline = barWidth / 2;
  let heightOfTriangle = halfBaseline * triangleHeightFactor;

  // curve bar area related offsets
  let outerCurveFactor = barWidth / 26;
  let curveBarAreaOffset = {
    width : 8 * outerCurveFactor,
    height : 7 * outerCurveFactor,
    outerCurveHeight : 9 * outerCurveFactor,
    outerCurveWdith : 10 * outerCurveFactor,
    outerCurCtrl1X : 0.00407789085 * outerCurveFactor,
    outerCurCtrl1Y : 13.2639443 * outerCurveFactor,
    outerCurCtrl2X : 13.2532577 * outerCurveFactor,
    outerCurCtrl2Y : 9.999999974752427e-7 * outerCurveFactor,
    innerCurCtrl1X : 4.022091400000001 * outerCurveFactor,
    innerCurCtrl1Y : 0.3753411 * outerCurveFactor,
    innerCurCtrl2X : 0.4 * outerCurveFactor,
    innerCurCtrl2Y : 4.0465096 * outerCurveFactor
  };

  let curveBarArea = {
    maxWidth : curveBarAreaOffset.width + barWidth,
    maxHeight : curveBarAreaOffset.height + barWidth
  };

  let width = imgSize[ 0 ] - heightOfTriangle - curveBarArea.maxWidth;
  let height = imgSize[ 1 ] - curveBarArea.maxHeight;

  let leftLine = {
    start : [ 0, 0 ],
    stop : [ 0, curveBarAreaOffset.outerCurveHeight + height ]
  };

  let outerCurve = {
    start : leftLine.stop,
    stop : [
      curveBarArea.maxWidth - curveBarAreaOffset.outerCurveWdith,
      curveBarArea.maxHeight + height
    ],
  };

  let outerCurveControl = {
    control1 : [
      outerCurve.start[ 0 ] + curveBarAreaOffset.outerCurCtrl1X,
      outerCurve.start[ 1 ] + curveBarAreaOffset.outerCurCtrl1Y
    ],
    control2 : [
      outerCurve.stop[ 0 ] - curveBarAreaOffset.outerCurCtrl2X,
      outerCurve.stop[ 1 ] - curveBarAreaOffset.outerCurCtrl2Y
    ]
  };

  let bottomHLine = {
    start : outerCurve.stop,
    stop : [ curveBarArea.maxWidth + width, outerCurve.stop[ 1 ] ]
  };

  let topOfArrow = [
    bottomHLine.stop[ 0 ] + heightOfTriangle,
    bottomHLine.stop[ 1 ] - halfBaseline
  ];

  let middleHLine = {
    start : [ bottomHLine.stop[ 0 ], bottomHLine.stop[ 1 ] - barWidth ],
    stop : [ curveBarArea.maxWidth, bottomHLine.stop[ 1 ] - barWidth ]
  };

  let innerCurve = {
    start : middleHLine.stop,
    stop : [ barWidth, height ]
  };


  let innerCurveControl = {
    control1 : [
      innerCurve.start[ 0 ] - curveBarAreaOffset.innerCurCtrl1X,
      innerCurve.start[ 1 ] - curveBarAreaOffset.innerCurCtrl1Y
    ],
    control2 : [
      innerCurve.stop[ 0 ] + curveBarAreaOffset.innerCurCtrl2X,
      innerCurve.stop[ 1 ] + curveBarAreaOffset.innerCurCtrl2Y
    ]
  };

  // construct path
  return `M${leftLine.start.join( ',' )} L${leftLine.stop.join( ',' )} C${outerCurveControl.control1.join( ',' )} ${outerCurveControl.control2.join(
    ',' )} ${outerCurve.stop.join( ',' )} L${bottomHLine.stop.join( ',' )} L${topOfArrow.join( ',' )} L${middleHLine.start.join(
    ',' )} L${middleHLine.stop.join( ',' )} C${innerCurveControl.control1.join( ',' )} ${innerCurveControl.control2.join(
    ',' )} ${innerCurve.stop.join( ',' )} L${barWidth},0 Z`;
}

export function genBranchLine( opts? : any ) : any {
  // default opts
  let svgSize = [
    _.get( opts, 'svgWidth', 120 ),
    _.get( opts, 'svgHeight', 132 )
  ];
  let barWidth = _.get( opts, 'barSize', 26 );
  let translate = _.get( opts, 'translate', [ 15, 2 ] );

  let SUPPORTED_STATES = [ 'default', 'hover', 'selected' ];

  let filters = <any>{
    'default' : `
      <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="filter-1">
          <feOffset dx="0" dy="1" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
          <feGaussianBlur stdDeviation="1" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
          <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.2 0" type="matrix" in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix>
          <feMerge>
              <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
              <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
      </filter>
    `.trim(),
    'hover' : `
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
    `.trim(),
    'selected' : `
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
    `.trim()
  };

  let fills = <any>{
    'default' : `
      <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-1">
          <stop stop-color="#ABB0C5" offset="0%"></stop>
          <stop stop-color="#C2C5DA" offset="100%"></stop>
      </linearGradient>
    `.trim(),
    'hover' : `
      <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-1">
          <stop stop-color="#ABB0C5" offset="0%"></stop>
          <stop stop-color="#C2C5DA" offset="100%"></stop>
      </linearGradient>
    `.trim(),
    'selected' : ``.trim()
  };

  let path = genBranchArrow(
    _.assign( {}, opts, {
      svgWidth : svgSize[ 0 ],
      svgHeight : svgSize[ 1 ],
      barWidth : barWidth,
      translate : translate,
      padding : {
        bottom: 35,
        right: 18
      }
    } ) );

  let groups = <any>{
    'default' : `
      <g id="branch-1" filter="url(#filter-1)" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(${translate[ 0 ]}, ${translate[ 1 ]})">
          <path d="${path}" id="Combined-Shape" fill="url(#linearGradient-1)"></path>
      </g>
    `.trim(),
    'hover' : `
      <g id="Spec" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" filter="url(#filter-1)" transform="translate(${translate[ 0 ]}, ${translate[ 1 ]})">
          <g id="Flogo_Branch-Configure-1" fill="url(#linearGradient-1)">
              <g id="branches">
                  <g id="branch-1" filter="url(#filter-2)">
                      <path d="${path}" id="Combined-Shape"></path>
                  </g>
              </g>
          </g>
      </g>
    `.trim(),
    'selected' : `
      <g id="Spec" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" filter="url(#filter-1)" transform="translate(${translate[ 0 ]}, ${translate[ 1 ]})">
          <g id="Flogo_Branch-Configure-1" fill="#8A90AE">
              <g id="branches">
                  <g id="branch-1" filter="url(#filter-2)">
                      <path d="${path}" id="Combined-Shape"></path>
                  </g>
              </g>
          </g>
      </g>
    `.trim()
  };

  let svgWrapper = `
  <svg width="${svgSize[ 0 ]}px" height="${svgSize[ 1 ]}px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        ___FILTER___
        ___FILL___
    </defs>
    ___GROUP___
  </svg>
  `.trim();

  let branchLines = <any>{};

  _.each( SUPPORTED_STATES, ( state : string ) => {
    branchLines[ state ] = svgWrapper.replace( '___FILTER___', filters[ state ] )
      .replace( '___FILL___', fills[ state ] )
      .replace( '___GROUP___', groups[ state ] );
  } );

  return branchLines;
}

export function normalizeTaskName(taskName:string) {
  return _.kebabCase(taskName);
}

export function updateFlogoGlobalConfig( config : any ) {
  (<any>window).FLOGO_GLOBAL = config;

  if ( localStorage ) {
    localStorage.setItem( 'FLOGO_GLOBAL', JSON.stringify( config ) );
  }
}

export function resetFlogoGlobalConfig() {
  // set default value
  updateFlogoGlobalConfig( {
    db : {
      protocol : 'http',
      host : 'localhost',
      port : '5984',
      name : 'flogo-web'
    },
    activities : {
      db : {
        protocol : 'http',
        host : 'localhost',
        port : '5984',
        name : 'flogo-web-activities'
      }
    },
    triggers : {
      db : {
        protocol : 'http',
        host : 'localhost',
        port : '5984',
        name : 'flogo-web-triggers'
      },
    },
    models : {
      db : {
        protocol : 'http',
        host : 'localhost',
        port : '5984',
        name : 'flogo-web-models'
      },
    },
    engine : {
      protocol : 'http',
      host : "localhost",
      port : "8080",
    },
    stateServer : {
      protocol : 'http',
      host : "localhost",
      port : "9190"
    },
    processServer : {
      protocol : 'http',
      host : "localhost",
      port : "9090"
    }
  } );
}

export function getFlogoGlobalConfig() : any {

  if ( !(<any>window).FLOGO_GLOBAL ) {
    let config : any;

    if ( localStorage ) {
      config = localStorage.getItem( 'FLOGO_GLOBAL' );

      if ( config ) {

        try {
          config = JSON.parse( config );
        } catch ( e ) {
          console.warn( e );
        }

        updateFlogoGlobalConfig( config );

        return config;
      }
    }

    resetFlogoGlobalConfig();
  }

  return (<any>window).FLOGO_GLOBAL;
}

function getURL( config : {
  protocol? : string;
  host : string;
  port? : string;
} ) : string {
  return config.port ?
         `${config.protocol || 'http'}://${config.host}:${config.port}` :
         `${config.protocol || 'http'}://${config.host}}`
}

export function getEngineURL() : string {
  return getURL( (<any>window).FLOGO_GLOBAL.engine );
}

export function getStateServerURL() : string {
  return getURL( (<any>window).FLOGO_GLOBAL.stateServer );
}

export function getProcessServerURL() : string {
  return getURL( (<any>window).FLOGO_GLOBAL.processServer );
}

/**
 * Copies content of an element into the system clipboard.
 * (Taken from UI cloud pattern library)
 *
 * Not all browsers may be supported. See the following for details:
 * http://caniuse.com/clipboard
 * https://developers.google.com/web/updates/2015/04/cut-and-copy-commands
 * @param  {HTMLElement} element The element containing the text to copy
 * @return {boolean} whether the copy operation is succeeded
 */
export function copyToClipboard(element:HTMLElement) {
  var sel = window.getSelection();
  var snipRange = document.createRange();
  snipRange.selectNodeContents(element);
  sel.removeAllRanges();
  sel.addRange(snipRange);
  var res = false;
  try {
    res = document.execCommand('copy');
  } catch (err) {
    // copy command is not available
    console.error(err);
  }
  sel.removeAllRanges();
  return res;
}

/**
 * Create a notification
 *
 * @param message
 * @param type: information, success, warming, error
 * @param time: the time to autoclose; if not configured, the notification wouldn't be autoclosed.
 * @param setting: inline style
 */
export function notification(message: string, type: string, time?: number, settings ?: any) {
  let styles = '';
  for (let key in settings) {
    styles += key + ':' + settings[key] + ';'
  }
  let template = `<div style="${styles}" class="${type} flogo-common-notification">${message}`;
  if(!time) {
    template += `
    <i class="fa fa-times flogo-common-notification-close"></i>
    `
  }
  template += '</div>';
  window.jQuery('body').append(template);
  let notification = $('body>div:last');
  setTimeout(function () {
    notification.addClass('on');
  }, 200);
  return new Promise((resolve, reject) => {
    if(time) {
      setTimeout(function () {
        notification.remove();
      }, time);
    }
    if(!time) {
      window.jQuery('.flogo-common-notification-close').click(() => {
        notification.remove();
        resolve();
      });
    } else {
      resolve();
    }
  })
}