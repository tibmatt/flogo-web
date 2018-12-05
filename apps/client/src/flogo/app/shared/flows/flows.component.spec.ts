import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, Output, EventEmitter, DebugElement } from '@angular/core';
import { BsModalComponent } from 'ng2-bs3-modal';
import { FlogoApplicationFlowsComponent } from './flows.component';
import { TimeFromNowPipe } from '@flogo-web/client/shared/pipes/time-from-now.pipe';
import { FlogoDeletePopupComponent } from '@flogo-web/client/shared/components/delete.popup.component';
import { NoDependenciesFakeLanguageModule } from '@flogo-web/client/core/language/testing';

@Component({
  selector: 'flogo-container',
  template: `
    <div class="flows"><flogo-apps-flows [flows]="flows"></flogo-apps-flows></div>
  `,
})
class ContainerComponent {
  @Output() changes = new EventEmitter();
  flows: Array<any> = [
    {
      id: '879',
      name: 'Log temperature',
      // tslint:disable-next-line:max-line-length
      description:
        'A complex flow for apietusam faccum esequi berum. Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt',
      createdAt: new Date(),
    },
    {
      id: '869',
      name: 'Log temperature 2',
      // tslint:disable-next-line:max-line-length
      description:
        'A complex flow for apietusam faccum esequi berum. Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt',
      createdAt: new Date(),
    },
    {
      id: '897',
      name: 'Manually adjust temperature',
      // tslint:disable-next-line:max-line-length
      description:
        'A flow for apietusam faccum esequi berum. Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt Luptas oilsksd as asdfwo',
      createdAt: new Date(),
    },
    {
      id: '987',
      name: 'Raise temperature & notifiy operator',
      description: 'A basic flow for apietusam',
      createdAt: new Date(),
    },
  ];

  flowsDisorder: Array<any> = [
    {
      id: '897',
      name: 'Manually adjust temperature',
      // tslint:disable-next-line:max-line-length
      description:
        'A flow for apietusam faccum esequi berum. Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt Luptas oilsksd as asdfwo',
      createdAt: new Date(),
    },
    {
      id: '987',
      name: 'Raise temperature & notifiy operator',
      description: 'A basic flow for apietusam',
      createdAt: new Date(),
    },
    {
      id: '879',
      name: 'Log temperature',
      // tslint:disable-next-line:max-line-length
      description:
        'A complex flow for apietusam faccum esequi berum. Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt',
      createdAt: new Date(),
    },
    {
      id: '869',
      name: 'Try to find pet',
      // tslint:disable-next-line:max-line-length
      description:
        'A complex flow for apietusam faccum esequi berum. Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt',
      createdAt: new Date(),
    },
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoDependenciesFakeLanguageModule],
      // declare the test component
      declarations: [
        FlogoApplicationFlowsComponent,
        BsModalComponent,
        ContainerComponent,
        TimeFromNowPipe,
        FlogoDeletePopupComponent,
      ],
    });
    return TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerComponent);
    fixture.detectChanges();
  });

  it('Should order the flows in alphabetical order', () => {
    const comp = fixture.componentInstance;
    comp.flows = comp.flowsDisorder;
    fixture.detectChanges();
    const res = fixture.debugElement.queryAll(By.css('.qa-flow-title'));
    const nameList = res.map(element => element.nativeElement.innerHTML.trim());
    expect(nameList).toEqual([
      'Log temperature',
      'Manually adjust temperature',
      'Raise temperature &amp; notifiy operator',
      'Try to find pet',
    ]);
  });

  it('Should render 4 flows', () => {
    const res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.qa-flow'));
    expect(res.length).toEqual(4);
  });

  it('Should display the flow title', () => {
    de = fixture.debugElement.query(By.css('.qa-flow-title:nth-of-type(1)'));
    el = de.nativeElement;
    expect(el.innerText).toEqual('Log Temperature');
  });

  it('Should display the flow description', () => {
    const res: Array<DebugElement> = fixture.debugElement.queryAll(
      By.css('.qa-flow-description')
    );
    el = res[3].nativeElement;
    expect(el.innerText).toEqual('A basic flow for apietusam');
  });
});
