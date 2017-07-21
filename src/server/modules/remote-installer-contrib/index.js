// import { config } from '../../config/app-config';
import _ from 'lodash';
import path from 'path';
import { fromUrl } from 'hosted-git-info';
import * as URL  from 'url';
import { http } from 'http';
import { getFileContent  } from '../../common/utils';
import { contribs as contribsDb } from '../../common/db';


export class RemoteInstallerContrib {

  static getRepoUrlParts(url) {
    url = url || '';

    // If url doesn't have a protocol, add it
    if (url.toLowerCase().search(/^(http|https)/) == -1){
      url = 'https://' + url;
    }

    let user = '', repo = '', path = '';
    let normalizedUrl = URL.parse(url);
    const urlItems = (normalizedUrl.path || '').split('/');
    if(urlItems.length >= 3) {
      user = urlItems[1];
      repo = urlItems[2];
      path = urlItems.slice(3).join('/');
    }
    return { repoUrl: `git@${normalizedUrl.host}:${user}/${repo}`, path }
  }

  /**
   *
   * @param sourceURLs
   * @returns {Promise|Promise<T>}
   */
  static getContentFromUrls(sourceURLs) {
    const promises = [];

    return new Promise((resolve, reject) => {
          sourceURLs.forEach((url) => {
            const repoUrlParts = this.getRepoUrlParts(url);
            const repoInfo = fromUrl(repoUrlParts.repoUrl);
            // get raw url
            let fileUrl = repoInfo.file(path.join(repoUrlParts.path, 'activity.json'));
            // fall back
            let promise = new Promise((resolve, reject)=> {
              getFileContent(fileUrl)
                .then((result) => {
                  resolve({content:JSON.parse(result), type:'activity'})
                })
                .catch(err => {
                  let fileUrl = repoInfo.file(path.join(repoUrlParts.path, 'trigger.json'));
                  getFileContent(fileUrl)
                    .then((result) => {
                      resolve({content:JSON.parse(result), type: 'trigger'})
                    })
                    .catch(err => {
                      reject('Cannot find activity.json or trigger.json');
                    })
                });
            });

            promises.push(promise);
          }); // end forEach sourceURLS

          const contribs = [];
          return Promise.all(promises).then(results => {
            results = results || [];
            results.forEach((result) => {
              contribs.push(result);
            });
            resolve(contribs);
          }).catch(err => {
            reject(new Error(err));
          });
    });
  }

}




