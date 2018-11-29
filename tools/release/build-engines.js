import '../utils/crash-on-unhandled-rejection';
import { resolve } from 'path';
import npmRunAll from 'npm-run-all';
import { Sources, Dist } from './config';

process.env.FLOGO_WEB_LOCALDIR = resolve(Dist.server, 'local');
process.chdir(Sources.server);
npmRunAll(['configure-engines'], {
  stdout: process.stdout,
  stderr: process.stderr,
  printLabel: true,
});
