import pick from 'lodash/pick';

import { contribs as contribsDb } from '../../common/db';
import { normalizeContribSchema } from '../../common/contrib-schema-normalize';
import { RemoteInstallerContrib } from '../contrib-installer/device';
import { Validator } from './../apps/validator';

const EDITABLE_FIELDS_CREATION = [
  'name',
  'type',
  'ref',
  'version',
  'title',
  'description',
  'settings',
  'outputs',
  'device_support',
];

export class ContribsManager {
  static cleanInput(contribution) {
    contribution = normalizeContribSchema(contribution);
    const cleanedContribution = pick(contribution, EDITABLE_FIELDS_CREATION);
    if (cleanedContribution.name) {
      cleanedContribution.name = cleanedContribution.name.trim();
    }
    return cleanedContribution;
  }

  static find(terms = {}) {
    return contribsDb.find(terms);
  }

  static install(urls) {
    const installContrib = contribution => {
      return new Promise((resolve, reject) => {
        contribution.content._id = contribution.content.ref;
        return contribsDb
          .put(contribution.content)
          .then(result => resolve({ ref: contribution.ref, status: 'success' }))
          .catch(err => resolve({ ref: contribution.ref, status: 'fail' }));
      });
    };

    return new Promise((resolve, reject) => {
      return RemoteInstallerContrib.getContentFromUrls(urls).then(contributions => {
        const installPromises = [];

        contributions.forEach(contribution => {
          if (contribution.content) {
            const cleanContribution = this.cleanInput(contribution.content);
            const validateFunction =
              contribution.content.type === 'flogo:device:trigger'
                ? Validator.validateTriggerDeviceCreate
                : Validator.validateActivityDeviceCreate;
            const errors = validateFunction(cleanContribution);
            installPromises.push(
              errors ? Promise.resolve({ ref: contribution.ref, status: 'fail' }) : installContrib(contribution)
            );
          } else {
            installPromises.push({ ref: contribution.ref, status: 'fail' });
          }
        });
        Promise.all(installPromises).then(results => {
          const installResults = { success: [], fail: [] };
          installResults.success = results.filter(result => result.status == 'success').map(item => item.ref);
          installResults.fail = results.filter(result => result.status == 'fail').map(item => item.ref);
          resolve(installResults);
        });
      });
    });
  }

  static findOne(name) {
    return contribsDb.findOne({ name });
  }

  static findByRef(ref) {
    return contribsDb.findOne({ ref });
  }

  static list() {
    return contribsDb.find({});
  }
}
