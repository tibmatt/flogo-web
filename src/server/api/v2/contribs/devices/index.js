import { ContribsManager  } from '../../../../modules/contribs'
import { ErrorManager } from '../../../../common/errors';

export function contribs(router){
  router.post(`/contributions/devices`, installContribs);
  router.get(`/contributions/devices`, listContribs);
  router.get(`/contributions/devices/:name`, getContribution);
}

async function listContribs(ctx) {
  const types = {
    'trigger': 'flogo:device:trigger',
    'activity': 'flogo:device:activity',
  };

  const search = {};
  const type = ctx.request.query['filter[type]'];
  const ref = ctx.request.query['filter[ref]'];
  if(type) {
    search.type = (types[type]? types[type] : type);
  } else if(ref){
    search.ref = ref;
  }

  const foundContribs = await ContribsManager.find(search);
  ctx.body = {
    data: foundContribs || [],
  };
}

async function getContribution(ctx)  {
  const name = ctx.params.name;

  const contribution = await ContribsManager.findOne(name);
  ctx.body = { data: contribution };
}

async function installContribs(ctx, next) {
  const url = ctx.request.body.url;

  let results = {};
    try {
      results = await ContribsManager.install( [url] );
    } catch ( err ) {
      throw new Error( '[error] Encounter error to add contributions to test engine.' );
    }

  if(results.fail.length) {
    throw ErrorManager.createRestError('Installation error in /contributions installContribs', {
      status: 400,
      title: 'Installation error',
      detail: 'There were one or more installation contrib problems',
      meta: results,
    });
  }

  ctx.body =  {
    data: {
      ref: results.success[0],
      originalUrl: url
    }
  };

  next();
}

