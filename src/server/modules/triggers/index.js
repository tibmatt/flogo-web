import pick from 'lodash/pick';
import get from 'lodash/get';
import { PUBLISH_FIELDS_SHORT, PUBLISH_FIELDS_LONG } from './constants';
import { triggersDBService } from '../../common/db/triggers';

export class TriggerManager {

  /**
   * List or find triggers
   *
   * ## searchTerms
   * - name {string}  find by name with exactly this name (case insensitive)
   * - ref {string} find by url ref property with exactly this ref property (case insensitive)
   * If both search terms are provided search is executed by name
   *
   * ## options
   * - fields {string} Possible values:
   *    - short {string} - get short version of  triggers
   *    - full {string} -  get full version of  triggers
   *    - raw {string} (deprecated) -  get raw version from db
   *
   * @param terms
   * @params terms.name {string} name of the app
   * @params terms.ref {string} url ref property
   * @params options
   * @params options.fields {string} which fields to retrieve, defaults to 'full' version
   */
  static find(terms, options) {
    terms = terms || {};
    const { fields } = Object.assign({ fields: 'full' }, options);

    return triggersDBService.db.find(terms)
          .then(result => (result || [])
            .map(triggerRow => cleanForOutput(triggerRow, fields)),
          );
  }

  static findByRef(ref) {
    return triggersDBService.db.findOne({ ref })
      .then(trigger => (trigger ? cleanForOutput(trigger) : null));
  }

}

function cleanForOutput(trigger, fields) {
  // To-Do: remove cleanTrigger.endpoint
  let cleanTrigger = Object.assign(
    {
      id: trigger.id || trigger._id,
      ref: trigger.ref,
      homepage: get(trigger, 'schema.homepage', ''),
      endpoint: get(trigger, 'schema.handler', {'settings': []})
    },
    trigger.schema
  );

  if(fields == 'raw') {
    return trigger;
  }

  if (fields === 'short') {
    cleanTrigger = pick(cleanTrigger, PUBLISH_FIELDS_SHORT);
  } else if (fields === 'full') {
    cleanTrigger = pick(cleanTrigger, PUBLISH_FIELDS_LONG);
  }
  return cleanTrigger;
}
