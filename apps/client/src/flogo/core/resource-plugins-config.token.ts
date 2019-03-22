import { InjectionToken } from '@angular/core';
import { ResourcePluginManifest } from '@flogo-web/client/core';

export const RESOURCE_PLUGINS_CONFIG = new InjectionToken<ResourcePluginManifest[]>(
  'flogo.resource-plugins'
);
