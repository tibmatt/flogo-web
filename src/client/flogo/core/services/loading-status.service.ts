import { Injectable } from '@angular/core';
import { Subject ,  Observable } from 'rxjs';

@Injectable()
export class LoadingStatusService {
  public _statusSource: Subject<boolean> = new Subject<boolean>();
  private _active = true;

  public get active(): boolean {
    return this._active;
  }

  public set active(v: boolean) {
    this._active = v;
    this._statusSource.next(v);
  }

  public get status(): Observable<boolean> {
    return this._statusSource.asObservable();
  }

  public start(): void {
    this.active = true;
  }

  public stop(): void {
    this.active = false;
  }
}
