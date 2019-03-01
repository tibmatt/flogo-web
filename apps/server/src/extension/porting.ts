import { Logger } from 'winston';
import { ResourceImporter, ResourceExporter, ResourceType } from '@flogo-web/server/core';

export class ResourceTypes {
  readonly types = new Map<string, ResourceType>();

  constructor(private logger: Logger) {}

  load(resourceType: ResourceType): void {
    this.types.set(resourceType.type, resourceType);
    this.logger.info(
      `Registered resource plugin '${resourceType.type}' (${resourceType.ref})`
    );
  }

  isKnownType(type: string): boolean {
    return this.types.has(type);
  }

  importer(type: string): ResourceImporter {
    this.throwIfUnknown(type);
    return this.types.get(type).import;
  }

  exporter(type: string): ResourceExporter {
    this.throwIfUnknown(type);
    return this.types.get(type).export;
  }

  allTypes(): ResourceType[] {
    return Array.from(this.types.values());
  }

  private throwIfUnknown(type: string) {
    if (!this.isKnownType(type)) {
      throw new Error('Unknwon resource type' + type);
    }
  }
}
