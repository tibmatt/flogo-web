import { ResourceHook, HookContext, ResourceHooks } from '@flogo-web/server/core';

export type ResourceLifecycleStage = 'create' | 'update' | 'remove' | 'get';
const lifecycleStages: ResourceLifecycleStage[] = ['create', 'update', 'remove', 'get'];

type HookRegistry = Map<ResourceLifecycleStage, ResourceHook[]>;

export class HookApplicator {
  private readonly beforeHooks: HookRegistry = new Map();
  private readonly afterHooks: HookRegistry = new Map();

  load(resourceHooks: ResourceHooks) {
    if (!resourceHooks) {
      return;
    }
    if (resourceHooks.before) {
      mergeHooks(resourceHooks.before, this.beforeHooks);
    }
    if (resourceHooks.after) {
      mergeHooks(resourceHooks.after, this.afterHooks);
    }
  }

  async wrapAndRun(
    forStage: ResourceLifecycleStage,
    context: HookContext,
    action: ResourceHook
  ) {
    this.throwIfUnknownStage(forStage);
    await this.runHooks(this.beforeHooks.get(forStage), context);
    await action(context);
    await this.runHooks(this.afterHooks.get(forStage), context);
    return context;
  }

  async runBefore(forStage: ResourceLifecycleStage, context: HookContext) {
    this.throwIfUnknownStage(forStage);
    return this.runHooks(this.beforeHooks.get(forStage), context);
  }

  async runAfter(forStage: ResourceLifecycleStage, context: HookContext) {
    this.throwIfUnknownStage(forStage);
    return this.runHooks(this.afterHooks.get(forStage), context);
  }

  private async runHooks(hooks: ResourceHook[] | null, context: HookContext) {
    if (hooks) {
      await runHooks(hooks, context);
    }
  }

  private throwIfUnknownStage(stage: any) {
    if (lifecycleStages.includes(stage)) {
      throw new Error(`HookApplicator: Uknown lifecycle stage "${stage}"`);
    }
  }
}

function mergeHooks(
  hooks: { [stage: string]: ResourceHook },
  into: Map<ResourceLifecycleStage, ResourceHook[]>
) {
  lifecycleStages.forEach(stageName => {
    let hooksForStage = into.get(stageName);
    if (!hooksForStage) {
      hooksForStage = [];
      into.set(name, hooksForStage);
    }
    hooksForStage.push(hooks[stageName]);
  });
}

async function runHooks(hooks: ResourceHook[], context: HookContext) {
  for (const hook of hooks) {
    await hook(context);
  }
}
