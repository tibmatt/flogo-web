import '../utils/crash-on-unhandled-rejection';
import { join, relative } from 'path';
import { Sources, Dist } from './config';

import copy from 'cpy';
import { runSync } from '../utils/npm-run';

(async () => {
  await copyParserFiles(Dist.root);
  await runSync(`install --production`, join(Dist.root, 'node_modules', 'flogo-parser'))
})();

export async function copyParserFiles(destination) {
  const pathToDest = join(destination, 'node_modules', 'flogo-parser');
  const parserDest = relative(Sources.parser, pathToDest);
  console.log('Copying parser files to: ', parserDest);
  return copy(['package.json',  'yarn.lock', 'dist/**/*.js'], parserDest, { parents: true, cwd:Sources.parser });
}
