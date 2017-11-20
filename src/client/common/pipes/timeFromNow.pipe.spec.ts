import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeFromNowPipe } from './time-from-now.pipe';

@Component({
  selector: 'flogo-test-container',
  template: `<span>{{ dateCreated | timeFromNow }}</span>`
})
class ContainerComponent {
  public dateCreated: any;

  constructor() {
    this.dateCreated = new Date();
  }
}

describe('Pipe: timeFromNow', () => {
  let fixture: ComponentFixture<ContainerComponent>;
  let container: ContainerComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimeFromNowPipe, ContainerComponent]
    });
  });

  it('The newly created component should be a recent one', done => {
    fixture = TestBed.createComponent(ContainerComponent);
    container = fixture.componentInstance;
    fixture.detectChanges();
    const de = fixture.debugElement.query(By.css('span'));
    const elText = de.nativeElement.innerHTML;
    expect(elText).toEqual('a few seconds ago');
    done();
  });

  it('Changing the dateCreated should update the text', done => {
    fixture = TestBed.createComponent(ContainerComponent);
    container = fixture.componentInstance;
    container.dateCreated.setHours(container.dateCreated.getHours() - 1);
    fixture.detectChanges();
    const de = fixture.debugElement.query(By.css('span'));
    const elText = de.nativeElement.innerHTML;
    expect(elText).toEqual('an hour ago');
    done();
  });

});
