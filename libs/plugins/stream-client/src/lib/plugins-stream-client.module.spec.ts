import { async, TestBed } from '@angular/core/testing';
import { PluginsStreamClientModule } from './plugins-stream-client.module';

describe('PluginsStreamClientModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [PluginsStreamClientModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(PluginsStreamClientModule).toBeDefined();
  });
});
