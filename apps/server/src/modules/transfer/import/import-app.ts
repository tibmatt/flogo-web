import { ContributionSchema } from '@flogo-web/core';
import {
  Resource,
  ResourceImportContext,
  Schemas,
  ValidationError,
  isValidationError,
  ValidationErrorDetail,
} from '@flogo-web/server/core';

import { constructApp } from '../../../core/models/app';
import { actionValueTypesNormalizer } from '../common/action-value-type-normalizer';
import { App, EngineSchemas } from '../../../interfaces';
import { validatorFactory } from './validator';
import { importTriggers } from './import-triggers';

export type ResourceImporterFn = (
  resource: Resource,
  context: ResourceImportContext
) => Resource | Promise<Resource>;

export async function importApp(
  rawApp: EngineSchemas.App,
  resolveImporterFn: (resourceType: string) => ResourceImporterFn,
  generateId: () => string,
  contributions: Map<string, ContributionSchema>
): Promise<App> {
  const now = new Date().toISOString();
  const newApp = cleanAndValidateApp(
    rawApp as EngineSchemas.App,
    Array.from(contributions.values()),
    generateId,
    now
  );
  const { resources, normalizedResourceIds } = normalizeResources(
    rawApp.resources || [],
    generateId,
    now
  );
  const { triggers, normalizedTriggerIds } = importTriggers(
    rawApp.triggers || [],
    normalizedResourceIds,
    generateId,
    now
  );
  newApp.triggers = triggers;

  const context: ResourceImportContext = {
    contributions,
    normalizedResourceIds: normalizedResourceIds,
    normalizedTriggerIds: normalizedTriggerIds,
  };
  const resolveImportHook = createImportResolver(resolveImporterFn, context);
  newApp.actions = await applyImportHooks(resources, resolveImportHook);
  normalizedResourceIds.clear();
  normalizedTriggerIds.clear();

  return newApp;
}

const resourcifyErrorPath = (resourceDataPath: string) => (d: ValidationErrorDetail) => ({
  ...d,
  dataPath: `${resourceDataPath}${d.dataPath}`,
});
async function applyImportHooks(
  resources: Resource[],
  applyImportHook: (resource: Resource) => Promise<Resource>
): Promise<Resource[]> {
  const validationErrors = [];
  const importedResources: Resource[] = [];

  const handleError = (e, resourceIndex: number) => {
    if (isValidationError(e)) {
      const resourcePath = `.resources[${resourceIndex}]`;
      const errorDetails = e.details.errors.map(resourcifyErrorPath(resourcePath));
      validationErrors.push(...errorDetails);
    } else {
      throw e;
    }
  };

  for (const [index, resource] of resources.entries()) {
    try {
      importedResources.push(await applyImportHook(resource));
    } catch (e) {
      handleError(e, index);
    }
  }
  if (validationErrors.length > 0) {
    throw new ValidationError(
      'There were one or more errors while trying to import resources',
      validationErrors
    );
  }
  return importedResources;
}

function cleanAndValidateApp(
  rawApp: EngineSchemas.App,
  contributions: ContributionSchema[],
  getNextId: () => string,
  now = null
): App {
  const validator = createValidator(contributions);
  validator.validate(rawApp);
  rawApp = rawApp as EngineSchemas.App;
  return constructApp({
    _id: getNextId(),
    name: rawApp.name,
    type: rawApp.type,
    description: rawApp.description,
    version: rawApp.version,
    properties: rawApp.properties || [],
  });
}

function normalizeResources(
  resources: EngineSchemas.Resource[],
  generateId: () => string,
  now: string
): { resources: Resource[]; normalizedResourceIds: Map<string, string> } {
  const normalizedResourceIds = new Map<string, string>();
  const normalizedResources: Resource[] = [];
  (resources || []).forEach(resource => {
    const [resourceType] = resource.id.split(':');
    let normalizedResource: Resource = {
      id: generateId(),
      name: resource.data.name,
      description: resource.data.description,
      type: resourceType,
      metadata: resource.data.metadata,
      createdAt: now,
      updatedAt: null,
      data: resource.data,
    };
    normalizedResource = actionValueTypesNormalizer(normalizedResource);
    normalizedResources.push(normalizedResource);
    normalizedResourceIds.set(resource.id, normalizedResource.id);
  });

  return {
    resources: normalizedResources,
    normalizedResourceIds,
  };
}

function createValidator(contributions: ContributionSchema[]) {
  const contribRefs = contributions.map(c => c.ref);
  return validatorFactory(Schemas.v1.app, contribRefs, {
    schemas: [Schemas.v1.common, Schemas.v1.trigger],
  });
}

function createImportResolver(
  resolveResourceImporter: (resourceType: string) => ResourceImporterFn,
  context: ResourceImportContext
) {
  return async (resource: Resource): Promise<Resource> => {
    const forType = resource.type;
    const resourceImporter = resolveResourceImporter(forType);
    if (resourceImporter) {
      return resourceImporter(resource, context);
    }
    // todo: error type
    throw new ValidationError(
      `Cannot process resource of type "${forType}", no plugin registered for such type.`,
      [
        {
          data: forType,
          dataPath: '.type',
          keyword: 'supported-resource-type',
          params: {
            type: forType,
          },
        },
      ]
    );
  };
}
