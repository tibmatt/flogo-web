import '../utils/crash-on-unhandled-rejection';
import { resolve } from 'path';
import { buildSubmodule } from '../utils/build-submodule';
import { Sources, Dist } from './config';

buildSubmodule({
  submoduleName: 'server',
  submodulePath: Sources.server,
  buildCommand: 'build -- {1}',
  commandArgs: [ resolve(Dist.server) ],
});
