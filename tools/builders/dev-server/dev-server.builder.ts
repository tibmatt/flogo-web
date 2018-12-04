import { resolve, normalize, Path } from '@angular-devkit/core';
import { BuildEvent, Builder, BuilderConfiguration, BuilderContext } from '@angular-devkit/architect';
import { ChildProcess, spawn } from 'child_process';
import { relative } from 'path';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

const treeKill = require('tree-kill');

interface BuildOptions {
  buildTarget: string;
  watch: boolean;
}

const TSNODE_BINARY = './node_modules/.bin/ts-node';
const TSNODE_DEV_BINARY = './node_modules/.bin/tsnd';
const DEFAULT_ARGS = ['--respawn', '--transpileOnly', '-r', 'tsconfig-paths/register'];

const normalizeTsConfig = (pathToTsConfig: string) =>
  pathToTsConfig.startsWith('..') || pathToTsConfig.startsWith('/') ? pathToTsConfig : `./${pathToTsConfig}`;

export default class ServerBuilder implements Builder<BuildOptions> {
  private subprocess: ChildProcess;

  constructor(private builderContext: BuilderContext) {}

  run(target: BuilderConfiguration<BuildOptions>): Observable<BuildEvent> {
    const buildTargetOptions = this.getConfig(target.options.buildTarget);
    const binary = this.resolveBinary(target.options.watch);
    return this.runProcess(binary, {
      cwd: target.root,
      main: relative(buildTargetOptions.root, buildTargetOptions.options.main),
      tsconfig: relative(buildTargetOptions.root, buildTargetOptions.options.tsConfig),
    }).pipe(
      map(() => ({ success: true })),
      catchError(e => of({ success: false }))
    );
  }

  private resolveBinary(watch: boolean) {
    return resolve(this.builderContext.workspace.root, normalize(watch ? TSNODE_DEV_BINARY : TSNODE_BINARY));
  }

  private runProcess(binary: string | Path, { cwd, main, tsconfig }: { cwd: string; main: string; tsconfig: string }) {
    return new Observable(observer => {
      const subprocess = spawn(binary, [...DEFAULT_ARGS, '-P', tsconfig, main], {
        cwd,
        env: process.env,
        stdio: 'inherit',
      });
      this.subprocess = subprocess;
      const killSubProcess = () => {
        if (!subprocess.killed) {
          treeKill(this.subprocess.pid, 'SIGKILL');
        }
      };
      process.on('exit', killSubProcess);

      this.subprocess.on('error', err => {
        this.builderContext.logger.fatal(err.message);
        observer.error(err);
      });

      this.subprocess.on('close', code => {
        if (code === 0) {
          this.builderContext.logger.info('Server completed with 0 code');
          observer.complete();
        } else {
          observer.error(new Error(`Failed with exit code: ${code}`));
        }
      });
      return killSubProcess;
    });
  }

  private getConfig(buildTarget: string) {
    const [project, target, configuration] = buildTarget.split(':');
    return this.builderContext.architect.getBuilderConfiguration<{ tsConfig: string; main: string }>({
      project,
      target,
      configuration,
    });
  }
}
