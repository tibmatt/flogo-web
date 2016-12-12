import {config} from '../../config/app-config';

import request from 'co-request';
import _ from 'lodash';

import {createFlow} from '../../api/flows/index';

import {dbService, loadSamplesConfig} from '../../config/app-config';

export function installSamples() {

  return new Promise((resolve, reject) => {

    console.log('Installing samples');
    let samplesVersion =  config.libVersion || 'master';
    samplesVersion = (samplesVersion == 'latest') ? 'master' : samplesVersion;

    dbService.areSamplesInstalled()
      .then((res)=> {
        console.log('Samples previously installed');
        resolve();
      })
      .catch((err)=> {
        if (err.status == 404) {
          console.log('Installing samples');
          downloadSamplesAndInstall(samplesVersion)
            .then((results) => {
              let allSamplesInstalled = true;
              results.forEach((result) => {
                if (!result.installed) {
                  allSamplesInstalled = false;
                  console.log('Sample:' + result.sample + ' could not be installed, check if the url is right');
                } else {
                  console.log('Sample:' + result.sample + ' installed correctly');
                }
              });
              if (allSamplesInstalled) {
                console.log('All samples were installed correctly');
              }
              dbService.markSamplesAsInstalled();
              resolve();
            });
        }
      });

  });


}

function downloadSamplesAndInstall(samplesVersion) {
  var samples = loadSamplesConfig();

  let promises = [];

  samples.forEach((sample)=> {
    console.log(`Samples version ${samplesVersion}`);
    sample.url = sample.url.replace('{version}', samplesVersion);
    console.log("Will download", sample.url);

    let promise = new Promise((resolve, reject) => {
      request({uri: sample.url, method: 'GET', json: true})
        .then((res) => {
          if (_.isEmpty(res.body)) {
            console.log('Error downloading ' + sample.url + ' verify that the url is correct');
            resolve({installed: false, sample: sample.url});
          } else {
            createFlow(res.body)
              .then((res) => {
                if (res.status !== 200) {
                  console.log(res);
                  resolve({installed: false, sample: sample.url});
                } else {
                  resolve({installed: true, sample: sample.url});
                }
              })
              .catch((err)=> {
                console.log('ERROR  installing:', err);
                resolve({installed: false, sample: sample.url});
              })
          }
        });

    });

    promises.push(promise);
  });

  return Promise.all(promises);
}
