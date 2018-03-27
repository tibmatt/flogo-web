import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagramRowComponent } from './diagram-row.component';

describe('DiagramRowComponent', () => {
  let component: DiagramRowComponent;
  let fixture: ComponentFixture<DiagramRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiagramRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagramRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
