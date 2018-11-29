import path from 'path';

const sourceRoot = 'src';
export const Sources = {
  root: '',
  client: path.join('apps', 'client'),
  server: path.join('apps', 'server'),
  packages: path.join(sourceRoot, 'packages'),
};

const root = 'dist';
const distSrcRoot = process.env.DIST_BUILD ? path.join(root, 'build') : 'dist';
export const Dist = {
  root,
  srcRoot: distSrcRoot,
  public: path.join(distSrcRoot, 'public'),
  server: path.join(distSrcRoot, 'server'),
  packages: path.join(distSrcRoot, 'packages'),
};

export const ABSOLUTE_DIST_SERVER_PATH = '/tmp/flogo-web/build/server';
