import { Resource } from '@flogo-web/core';
import { ResourcePluginManifest } from '@flogo-web/client-core';

export interface ResourceWithPlugin extends Resource {
  pluginInfo: ResourcePluginManifest;
}
