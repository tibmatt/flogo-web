import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeFromNowPipe } from './time-from-now.pipe';

@Component({
  selector: 'container',
  template: `
            <span>{{dateCreated | timeFromNow}}</span>
            `
})
class Container {
  public dateCreated : any;
  constructor(){
    this.dateCreated = new Date();
  }
}

describe('Pipe: timeFromNow', () => {
  let fixture: ComponentFixture<Container>, container: Container;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeFromNowPipe, Container ]
    });
  });

  it('The newly created component should be a recent one', done => {
    fixture = TestBed.createComponent(Container);
    container = fixture.componentInstance;
    fixture.detectChanges();
    let de = fixture.debugElement.query(By.css('span'));
    let elText = de.nativeElement.innerHTML;
    expect(elText).toEqual('a few seconds ago');
    done();
  });

  it('Changing the dateCreated should update the text', done => {
    fixture = TestBed.createComponent(Container);
    container = fixture.componentInstance;
    container.dateCreated.setHours(container.dateCreated.getHours() - 1);
    fixture.detectChanges();
    let de = fixture.debugElement.query(By.css('span'));
    let elText = de.nativeElement.innerHTML;
    expect(elText).toEqual('an hour ago');
    done();
  });

});
