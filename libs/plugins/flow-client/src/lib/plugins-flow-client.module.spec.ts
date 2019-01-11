import { async, TestBed } from '@angular/core/testing';
import { PluginsFlowClientModule } from './plugins-flow-client.module';

describe('PluginsFlowClientModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [PluginsFlowClientModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(PluginsFlowClientModule).toBeDefined();
  });
});
