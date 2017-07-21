import pick from 'lodash/pick';

import { contribs as contribsDb  } from '../../common/db';
import { RemoteInstallerContrib } from './../remote-installer-contrib';
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
  'device_support'
];


export class ContribsManager {

  static cleanInput(contribution) {
    const cleanedContribution = pick(contribution, EDITABLE_FIELDS_CREATION);
    if (cleanedContribution.name) {
     cleanedContribution.name = cleanedContribution.name.trim();
    }
    return cleanedContribution;
  }

  static find(terms = {}) {
    return contribsDb.find(terms)
  }

  static create(urls) {
    const install = (contribution => {
      return new Promise((resolve, reject)=> {
        contribution._id = contribution.ref;
        return contribsDb.put(contribution)
          .then((result)=> resolve(contribution))
          .catch((err)=> reject(contribution));
      });
    });

    return new Promise((resolve, reject) => {

      return RemoteInstallerContrib.getContentFromUrls(urls)
        .then(contributions => {
          const installPromises = [];
          contributions.forEach((contribution) => {
            const cleanContribution = this.cleanInput(contribution.content);
            const validateFunction = (contribution.type === 'trigger') ? Validator.validateTriggerDeviceCreate : Validator.validateActivityDeviceCreate;
            const errors = validateFunction(cleanContribution);
            installPromises.push(errors ? Promise.reject(contribution.content) : install(contribution.content));
          });
          const mapResponse = (response) => (response || []).map((res) => res.ref);
          Promise.all(installPromises)
            .then((results) => resolve({success: mapResponse(results), fail: [] }) )
            .catch(err => resolve({success: [], fail: mapResponse([err]) }));
        })
        .catch(err => reject(err));
    });
  }

  static findOne(name) {
    return contribsDb.findOne({name});
  }

  static list() {
    return contribsDb.find({});
  }
}
