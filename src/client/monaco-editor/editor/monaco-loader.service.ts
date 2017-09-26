import { Inject, Injectable, OpaqueToken } from '@angular/core';

export const SRC_PATH = new OpaqueToken('SRC_PATH');

declare const require: any;

@Injectable()
export class MonacoLoaderService {
  private _loaded = false;
  private _loadPromise: Promise<void>;
  // todo: remove after setup systemjs correctly to load monaco
  private _globalsBackup: any = null;
  private _amdLoader: any = null;

  constructor(@Inject(SRC_PATH) private srcPath) {

  }

  get monacoLoaded() {
    return this._loaded;
  }

  load() {
    // Fast path - monaco is already loaded
    if (this._loaded && typeof ((<any>window).monaco) === 'object') {
      (<any>window).define = this._amdLoader.define;
      (<any>window).require = this._amdLoader.require;
      return this.waitForMonaco();
    }

    const pathToMonacoVs = this.srcPath;
    this._loadPromise = new Promise<void>(resolve => {
      const onGotAmdLoader = () => {
        const amdLoader = (<any>window).require;
        this._amdLoader = {
          require: amdLoader,
          define: (<any>window).define
        };

        amdLoader.config({ paths: { 'vs': this.srcPath } });
        amdLoader(['vs/editor/editor.main'], () => {
          resolve();
        });
      };

      try {
        this._globalsBackup = {
          define: (<any>window).define,
          require: (<any>window).require,
        };
        (<any>window).define = null;
        (<any>window).require = null;
        if (!document.getElementById('monaco-loader') || !(<any>window).require) {
          const loaderScript = document.createElement('script');
          loaderScript.type = 'text/javascript';
          loaderScript.src = `${pathToMonacoVs}/loader.js`;
          loaderScript.id = 'monaco-loader';
          loaderScript.addEventListener('load', onGotAmdLoader);
          document.body.appendChild(loaderScript);
        } else {
          onGotAmdLoader();
        }
      } catch (error) {
        // for now we're just logging the error
        console.error(error);
      }
    });
    // if (!this._loaded) {
    //   this._loadPromise = new Promise<void>(resolve => {
    //     // Fast path - monaco is already loaded
    //     if (typeof ((<any>window).monaco) === "object") {
    //       resolve();
    //       return;
    //     }
    //
    //     const onGotAmdLoader = () => {
    //       // Load monaco
    //       (<any>window).require.config({ paths: { "vs": pathToMonacoVs } });
    //       (<any>window).require(["vs/editor/editor.main"], () => {
    //         this._loaded = true;
    //         resolve();
    //       });
    //     };
    //
    //     // Load AMD loader if necessary
    //     const win = <any> window;
    //     if (!win.require || !win.require.config) {
    //       (<any>window).require = null;
    //       const loaderScript = document.createElement("script");
    //       loaderScript.type = "text/javascript";
    //       loaderScript.src = `${pathToMonacoVs}/loader.js`;
    //       loaderScript.addEventListener("load", onGotAmdLoader);
    //       document.body.appendChild(loaderScript);
    //     } else {
    //       onGotAmdLoader();
    //     }
    //   });
    // }

    return this.waitForMonaco();
  }

  // todo: need to setup systemjs correctly to load monaco
  restoreGlobals() {
    if (!this._globalsBackup) {
      return;
    }
    (<any>window).define = this._globalsBackup.define;
    (<any>window).require = this._globalsBackup.require;
  }

  // Returns promise that will be fulfilled when monaco is available
  waitForMonaco(): Promise<void> {
    return this._loadPromise;
  }
}
