import path from 'path';

const sourceRoot = 'src';
export const Sources = {
  root: sourceRoot,
  client: path.join(sourceRoot, 'client'),
  server: path.join(sourceRoot, 'server'),
  parser: path.join(sourceRoot, 'parser'),
  packages: path.join(sourceRoot, 'packages'),
};

const distRoot = process.env.DIST_BUILD ? path.join('dist', 'build') : 'dist';
export const Dist = {
  root: distRoot,
  public: path.join(distRoot, 'public'),
  server: path.join(distRoot, 'server'),
  packages: path.join(distRoot, 'packages'),
};
