import '../utils/crash-on-unhandled-rejection';
import { resolve } from 'path';
import { Sources, Dist } from './config';
import { buildSubmodule } from '../utils/build-submodule';

buildSubmodule({
  submoduleName: 'client',
  submodulePath: Sources.client,
  buildCommand: 'build -- --progress false --output-path {1}',
  commandArgs: [ resolve(Dist.public) ],
});
