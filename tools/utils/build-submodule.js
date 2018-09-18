import npmRunAll from 'npm-run-all';

const run = (cmd, opts = {}) => npmRunAll([cmd], {
  printName: true,
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr,
  ...opts,
});

export function buildSubmodule({ submoduleName, submodulePath, buildCommand, commandArgs = [] }) {
  return run(`install:submodule:${submoduleName}`)
    .then(() => {
      const origCwd = process.cwd();
      process.chdir(submodulePath);
      return run(buildCommand, { arguments: commandArgs })
        .then(() => process.chdir(origCwd));
    });
}

