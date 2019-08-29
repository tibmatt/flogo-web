import { async, TestBed } from '@angular/core/testing';
import { OrganicClientModule } from './organic-client.module';

describe('OrganicClientModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [OrganicClientModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(OrganicClientModule).toBeDefined();
  });
});
