import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamDesignerComponent } from './stream-designer.component';

describe('StreamDesignerComponent', () => {
  let component: StreamDesignerComponent;
  let fixture: ComponentFixture<StreamDesignerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StreamDesignerComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreamDesignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
