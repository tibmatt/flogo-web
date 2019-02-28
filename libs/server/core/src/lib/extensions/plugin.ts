import { ResourceHooks } from './resource-hooks';
import { ResourceImporter } from './resource-importer';
import { ResourceExporter } from './resource-exporter';

export interface ResourcePlugin<R = unknown> {
  type: string;
  ref: string;
  import: ResourceImporter<R>;
  export: ResourceExporter<R>;
  hooks?: {
    resource?: ResourceHooks<R>;
  };
}

export interface ResourceRegistrar {
  use(pluginDefinition: ResourcePlugin): void;
}
