import { Injector } from '@angular/core';
import { appInjector } from './injector.service';
import { ConfigurationService } from './configuration.service';

export const isConfigurationLoaded = () => {
    let injector: Injector = appInjector();
    let config: ConfigurationService = injector.get(ConfigurationService);

    return config.getConfiguration()
        .then(() => {
            return true;
        })
        .catch((err) => {
            console.log(err);
            return false;
        });
}
