import fs from 'fs';
import path from 'path';
import https from 'https';

import gulp from 'gulp';

import {CONFIG} from '../../config';

const DEFAULT_PALETTE_FILENAME = 'default-palette.json';
const MEDIA_TYPE_RAW = 'application/vnd.github.v3.raw+json';
const REPO = 'TIBCOSoftware/flogo-contrib';
const GITHUB_TOKEN = process.env['FLOGO_WEB_GITHUB_TOKEN'] || process.env['GITHUB_USER_TOKEN'] || process.env['GITHUB_TOKEN'];
const target = process.env.DIST_BUILD ? CONFIG.paths.dist.server : CONFIG.paths.source.server;

/**
 *
 */
gulp.task('palette.build', 'Build default palette', [], cb => {

  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB TOKEN not found');
  }

  Promise.all([
    getAll('activity'),
    getAll('trigger')
  ])
    .then(([activities, triggers]) => makePalette(
      triggers
        .concat(activities)
        .concat([{
          type: 'action',
          ref: 'github.com/TIBCOSoftware/flogo-contrib/action/flow'
        }])
    ))
    .then(result => writeJsonFile(path.resolve(CONFIG.paths.source.server, 'config', DEFAULT_PALETTE_FILENAME), result))
    .then(() => cb())
    .catch(err => {
      console.error(err);
      cb(err);
    })

});

function makePalette(extensions) {
  return {
    name: 'default',
    version: '0.0.1',
    title: 'Default Palette',
    description: 'Default flogo palette',
    extensions
  };
}

function writeJsonFile(target, contents) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(target, JSON.stringify(contents, null, 4), function(err) {
      if(err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

}

function getAll(type) {
  return getRepoContents(type)
    .then(all => Promise.all(
        all
          .filter(each => each.type == 'dir')
          .map(each => {
            const descriptorPath = `${each.path}/${type}.json`;
            return getRepoContents(descriptorPath, { rawContent: true })
              .then(contrib => ({
                type: type,
                ref: contrib.ref
              }))
              .catch(err => {
                console.warn(`Error reading descriptor for "${descriptorPath}"`);
              })
          })
          .filter(result => !!result)
      ))
}

/**
 *
 * @param contentsPath
 * @param options (optional)
 * @param options.rawContent
 * @returns {Promise}
 */
function getRepoContents(contentsPath, options) {
  options = options || {};

  return new Promise((resolve, reject) => {
    let reqOptions = {
      protocol: 'https:',
      hostname: 'api.github.com',
      path: `/repos/${REPO}/contents/${contentsPath}`,
      headers: {
        'User-Agent': 'fg-testing'
      }
    };

    if(options.rawContent) {
      reqOptions.headers['Accept'] = MEDIA_TYPE_RAW;
    }

    if(GITHUB_TOKEN) {
      reqOptions.headers['Authentication'] = `Basic ${GITHUB_TOKEN}`;
    }

    https.get(reqOptions, response => {
      var body = '';
      response.on('data', function(d) {
        body += d;
      });
      response.on('end', function() {
        try {
          // Data reception is done, do whatever with it!
          var parsed = JSON.parse(body);
          resolve(parsed);
        } catch (e) {
          reject(new Error(e));
        }

      });
    }).on('error', (e) => {
      reject(new Error(e));
    });
  });

}
