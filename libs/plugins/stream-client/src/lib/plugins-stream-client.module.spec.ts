import { async, TestBed } from '@angular/core/testing';
import { CoreModule, HOSTNAME } from '@flogo-web/lib-client/core';
import { PluginsStreamClientModule } from './plugins-stream-client.module';

describe('PluginsStreamClientModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CoreModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(PluginsStreamClientModule).toBeDefined();
  });
});
