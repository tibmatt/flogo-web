import { fromUrl } from 'hosted-git-info';
import * as URL from 'url';
import { getRemoteFileContent } from '../../../common/utils';

export class RemoteInstallerContrib {
  static getRepoUrlParts(url) {
    let user = '',
      repo = '',
      path = '';
    let normalizedUrl = URL.parse(url);
    const urlItems = (normalizedUrl.path || '').split('/');
    if (urlItems.length >= 3) {
      user = urlItems[1];
      repo = urlItems[2];
      path = urlItems.slice(3).join('/');
    }
    return { repoUrl: `git@${normalizedUrl.host}:${user}/${repo}`, path };
  }

  /**
   *
   * @param sourceURLs
   * @returns {Promise|Promise<T>}
   */
  static getContentFromUrls(sourceURLs) {
    const promises = [];

    const urls = sourceURLs.map(url => {
      let protocol = '';
      let sourceURL = (url || '').toLowerCase();
      // If url doesn't have a protocol, add it
      if (sourceURL.search(/^(http|https)/) == -1) {
        protocol = 'http://';
      }
      return { formatted: `${protocol}${sourceURL}`, original: url };
    });

    const getJSONContent = function(url) {
      return getRemoteFileContent(url)
        .then(result => JSON.parse(result))
        .catch(err => Promise.reject(err));
    };

    return new Promise((resolve, reject) => {
      urls.forEach(url => {
        let promise = null;
        // if is a raw url
        if (url.formatted.endsWith('.json')) {
          promise = getJSONContent(url.formatted)
            .then(result => Promise.resolve({ content: result, ref: url.original }))
            .catch(err => Promise.resolve({ content: null, ref: url.original }));
        } else {
          const repoUrlParts = this.getRepoUrlParts(url.formatted);
          const repoInfo = fromUrl(repoUrlParts.repoUrl);
          if (!repoInfo) {
            promise = Promise.resolve({ content: null, ref: url.original });
          } else {
            // get raw url
            let fileUrl = repoInfo.file([repoUrlParts.path, 'activity.json'].join('/'));
            // fall back
            promise = getJSONContent(fileUrl)
              .then(result => Promise.resolve({ content: result, ref: url.original }))
              .catch(err => {
                let fileUrl = repoInfo.file(
                  [repoUrlParts.path, 'trigger.json'].join('/')
                );
                return getJSONContent(fileUrl)
                  .then(result => Promise.resolve({ content: result, ref: url.original }))
                  .catch(err => Promise.resolve({ content: null, ref: url.original }));
              });
          }
        }
        promises.push(promise);
      }); // end forEach sourceURLS

      return Promise.all(promises)
        .then(results => resolve(results))
        .catch(err => reject(new Error(err)));
    });
  }
}
