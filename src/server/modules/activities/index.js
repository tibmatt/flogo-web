import pick from 'lodash/pick';
import get from 'lodash/get';
import { PUBLISH_FIELDS_SHORT, PUBLISH_FIELDS_LONG } from './constants';
import { activitiesDBService } from '../../config/app-config';

export class ActivitiesManager {

  /**
   * List or find activities
   *
   * ## searchTerms
   * - name {string}  find by name with exactly this name (case insensitive)
   * - ref {string} find by url ref property with exactly this property (case insensitive)
   * If both search terms are provided search is executed by name
   *
   * ## options
   * - fields {string} Possible values:
   *    - short {string} - get short version of  activities
   *    - full {string} -  get full version of  activities
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
    const { fields } = Object.assign({ fields: 'full'}, options);

    return activitiesDBService.db.find(terms)
      .then(result => (result || [])
        .map(activityRow => cleanForOutput(activityRow, fields))
      );
  }
}

function cleanForOutput(activity, fields) {
  let cleanActivity = Object.assign(
    { id: activity.id || activity._id },
    {ref: activity.ref, homepage:get(activity, 'schema.homepage', '')},
    activity.schema
  );

  if(fields == 'raw') {
    return activity;
  }

  if (fields === 'short') {
    cleanActivity = pick(cleanActivity, PUBLISH_FIELDS_SHORT);
  } else if (fields === 'full') {
    cleanActivity = pick(cleanActivity, PUBLISH_FIELDS_LONG);
  }
  return cleanActivity;
}
