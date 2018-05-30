/**
 *  @param {function(context: koa.Context, buildOptions: object): PromiseLike<{ fileName: string, content: * }>} performBuild -
 *    Function to execute to build the app
 * @param performBuild
 * @return {build}
 */
export function buildHandler(performBuild) {
  return async function build(context) {
    context.req.setTimeout(0);
    const options = getCompileOptions(context);
    const { fileName, content } = await performBuild(context, options);
    context.attachment(fileName);
    context.body = content;
  }
}

function getCompileOptions(context) {
  const options = { compile: {} };
  options.compile.os = context.query.os || null;
  options.compile.arch = context.query.arch || null;
  return options;
}
