import { ContainerModule, interfaces } from 'inversify';
import {
  AppImporterFactory,
  LegacyAppImporterFactory,
  StandardAppImporterFactory,
} from '../../modules/importer';

export const InOutModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(AppImporterFactory).toSelf();
  bind(LegacyAppImporterFactory).toSelf();
  bind(StandardAppImporterFactory).toSelf();
});
