import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TileTaskComponent } from './tile-task.component';

describe('TileTaskComponent', () => {
  let component: TileTaskComponent;
  let fixture: ComponentFixture<TileTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TileTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TileTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
