import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, Output, EventEmitter, DebugElement } from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { FlogoApplicationFlowsComponent } from './flows.component';
import { FlogoModal } from '../../core/services/modal.service';
import { TimeFromNowPipe } from '../../shared/pipes/time-from-now.pipe';
import { FlogoDeletePopupComponent } from '../../shared/components/delete.popup.component';
import { NoDependenciesFakeLanguageModule } from '@flogo/core/language/testing';

@Component({
  selector: 'flogo-container',
  template: `
                <div class="flows">
                    <flogo-apps-flows [flows]="flows"></flogo-apps-flows>
                </div>
            `
})
class ContainerComponent {
  @Output() changes = new EventEmitter();
  flows: Array<any> = [
    {
      id: '879',
      name: 'Log temperature',
      // tslint:disable-next-line:max-line-length
      description: 'A complex flow for apietusam faccum esequi berum. Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt',
      createdAt: new Date()
    },
    {
      id: '869',
      name: 'Log temperature 2',
      // tslint:disable-next-line:max-line-length
      description: 'A complex flow for apietusam faccum esequi berum. Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt',
      createdAt: new Date()
    },
    {
      id: '897',
      name: 'Manually adjust temperature',
      // tslint:disable-next-line:max-line-length
      description: 'A flow for apietusam faccum esequi berum. Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt Luptas oilsksd as asdfwo',
      createdAt: new Date()
    },
    {
      id: '987',
      name: 'Raise temperature & notifiy operator',
      description: 'A basic flow for apietusam',
      createdAt: new Date()
    }
  ];

  flowsDisorder: Array<any> = [
    {
      id: '897',
      name: 'Manually adjust temperature',
      // tslint:disable-next-line:max-line-length
      description: 'A flow for apietusam faccum esequi berum. Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt Luptas oilsksd as asdfwo',
      createdAt: new Date()
    },
    {
      id: '987',
      name: 'Raise temperature & notifiy operator',
      description: 'A basic flow for apietusam',
      createdAt: new Date()
    },
    {
      id: '879',
      name: 'Log temperature',
      // tslint:disable-next-line:max-line-length
      description: 'A complex flow for apietusam faccum esequi berum. Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt',
      createdAt: new Date()
    },
    {
      id: '869',
      name: 'Try to find pet',
      // tslint:disable-next-line:max-line-length
      description: 'A complex flow for apietusam faccum esequi berum. Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt',
      createdAt: new Date()
    }
  ];

  // helper function to repeat the event propagation
  changed(value, property) {
    this.changes.emit(value);
  }
}

describe('Application flows', () => {
  let fixture: ComponentFixture<ContainerComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  function compileComponent() {
    return TestBed.compileComponents();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoDependenciesFakeLanguageModule],
      // declare the test component
      declarations: [FlogoApplicationFlowsComponent, ModalComponent, ContainerComponent, TimeFromNowPipe, FlogoDeletePopupComponent],
      providers: [FlogoModal]
    });
  });

  it('Should order the flows in alphabetical order', done => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(ContainerComponent);
        const comp = fixture.componentInstance;
        comp.flows = comp.flowsDisorder;
        fixture.detectChanges();
        const res = fixture.debugElement.queryAll(By.css('.flogo-flow-title'));
        const nameList = res.map(element => element.nativeElement.innerHTML.trim());
        expect(nameList).toEqual(['Log temperature', 'Manually adjust temperature',
          'Raise temperature &amp; notifiy operator', 'Try to find pet']);
        done();
      });
  });

  it('Should render 4 flows', done => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(ContainerComponent);
        fixture.detectChanges();
        const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.flogo-flow'));
        expect(res.length).toEqual(4);
        done();
      });
  });

  it('Should display the flow title', done => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(ContainerComponent);
        fixture.detectChanges();
        de = fixture.debugElement.query(By.css('.flogo-flow-title:nth-of-type(1)'));
        el = de.nativeElement;
        expect(el.innerText).toEqual('Log Temperature');
        done();
      });
  });

  it('Should display the flow description', done => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(ContainerComponent);
        fixture.detectChanges();
        const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.flogo-flow-description'));
        el = res[3].nativeElement;
        expect(el.innerText).toEqual('A basic flow for apietusam');
        done();
      });
  });

});

