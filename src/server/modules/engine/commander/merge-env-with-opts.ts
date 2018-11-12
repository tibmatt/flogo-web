const DEFAULT_CGO_ENABLED = '0';

type Dictionary<T=any> = { [key: string]: T | undefined };
export function mergeEnvWithOpts(opts: Dictionary, processEnv: Dictionary<string>) {
  let customEnv: Dictionary = {};
  if (processEnv.CGO_ENABLED === undefined) {
    customEnv.CGO_ENABLED = DEFAULT_CGO_ENABLED;
  }

  if (opts.compile) {
    customEnv = appendCompilationOptions(opts.compile, customEnv);
  }

  return { ...processEnv, ...customEnv };
}

function appendCompilationOptions(compile: Dictionary, customEnv: Dictionary<string>) {
  if (compile.os) {
    customEnv.GOOS =compile.os;
  }

  if (compile.arch) {
    customEnv.GOARCH = compile.arch;
  }

  return customEnv;
}
