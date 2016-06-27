/**
 * Download GitHub repo to local environment.
 *
 * Configurations:
 *    1. A cache folder to save the GitHub repositories.
 *        In such way, the installer can install the package.json from
 *        its subdirectories using npm command.
 *
 * Folder structures:
 *
 *  cache
 *  |-- activity
 *      |-- some activity
 *  |-- trigger
 *      |-- some trigger
 *
 * Operational logic
 *  1. Trigger download API with a given URL list
 *  2. Verify if the repo(s) exists
 *    2.1. If exists, update the repo in cache folder
 *    2.2. If doesn't exist, checkout the given repo in cache folder
 *  3. After finishing, return a success list and a fail list.
 */
export class GitHubRepoDownloader {

}

