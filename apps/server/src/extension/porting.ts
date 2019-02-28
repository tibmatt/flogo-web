import { ResourceImporter, ResourceExporter } from '@flogo-web/server/core';

interface PortingGroup {
  import: ResourceImporter;
  export: ResourceExporter;
}

export class ResourcePorting {
  readonly porters = new Map<string, PortingGroup>();

  load(type: string, porters: PortingGroup): void {
    this.porters.set(type, porters);
  }

  isKnownType(type: string): boolean {
    return this.porters.has(type);
  }

  importer(type: string): ResourceImporter {
    this.throwIfUnknown(type);
    return this.porters.get(type).import;
  }

  exporter(type: string): ResourceExporter {
    this.throwIfUnknown(type);
    return this.porters.get(type).export;
  }

  private throwIfUnknown(type: string) {
    if (!this.isKnownType(type)) {
      throw new Error('Unknwon resource type' + type);
    }
  }
}
