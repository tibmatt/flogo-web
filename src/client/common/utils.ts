
// URL safe base64 encoding
// reference: https://gist.github.com/jhurliman/1250118
import { FLOGO_TASK_TYPE, FLOGO_TASK_ATTRIBUTE_TYPE } from './constants';
export function flogoIDEncode( id : string ) {
  return btoa( id )
    .replace( /\+/g, '-' )
    .replace( /\//g, '_' )
    .replace( /=+$/, '' );
}

// URL safe base64 decoding
// reference: https://gist.github.com/jhurliman/1250118
export function flogoIDDecode( encodedId : string ) {

  encodedId = encodedId.replace( /-/g, '+' )
    .replace( /_/g, '/' );

  while ( encodedId.length % 4 ) {
    encodedId += '=';
  }

  return atob( encodedId );
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
      input.type = _.get(FLOGO_TASK_ATTRIBUTE_TYPE, _.get(input, 'type', 'STRING').toUpperCase(), FLOGO_TASK_ATTRIBUTE_TYPE.STRING);
    }
  );

  return task;
}
