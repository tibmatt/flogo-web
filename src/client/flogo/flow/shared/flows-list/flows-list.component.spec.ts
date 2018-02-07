import {FlowsListComponent} from '@flogo/flow/shared/flows-list/flows-list.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DebugElement} from '@angular/core';
import {SharedModule as FlogoSharedModule} from '@flogo/shared';
import {FakeRootLanguageModule} from '@flogo/core/language/testing';
import {FormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';

describe('Component: FlowsListComponent', () => {
  let comp: FlowsListComponent;
  let fixture: ComponentFixture<FlowsListComponent>;
  let de: DebugElement;

  function compileComponents() {
    return TestBed.compileComponents();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        FlogoSharedModule,
        FakeRootLanguageModule
      ],
      declarations: [
        FlowsListComponent
      ]
    });
  });

  it('Should show empty flow message', (done) => {
    compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FlowsListComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        comp.list = [];
        fixture.detectChanges();
        expect(de.queryAll(By.css('.flogo-list__container.--empty')).length).toEqual(1);
        done();
      });
  });

  it('Should list 3 applications', (done) => {
    compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FlowsListComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        comp.list = getFlowsList();
        fixture.detectChanges();
        expect(de.queryAll(By.css('.flogo-list__card')).length).toEqual(3);
        done();
      });
  });

  it('Should filter 2 applications when filtered by term \'hello\'', (done) => {
    compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FlowsListComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        comp.list = getFlowsList();
        comp.searchText = 'Hello';
        fixture.detectChanges();
        expect(de.queryAll(By.css('.flogo-list__card')).length).toEqual(2);
        done();
      });
  });

  it('Should form proper link to open a flow in new tab', (done) => {
    compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FlowsListComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        comp.list = getFlowsList();
        fixture.detectChanges();
        const firstLink = de.queryAll(By.css('.flogo-link'))[0].nativeElement;
        expect(firstLink.getAttribute('href')).toEqual('/flows/flow_1');
        done();
      });
  });

  it('Should emit selected flow\'s details', (done) => {
    compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FlowsListComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        comp.list = getFlowsList();
        comp.onUserSelection.subscribe((event) => {
          expect(event.id).toEqual('flow_1');
          done();
        });
        fixture.detectChanges();
        const firstSelectFlowButton = de.queryAll(By.css('.flogo-list__card .flogo-button--secondary'))[0].nativeElement;
        firstSelectFlowButton.click();
      });
  });

  function getFlowsList() {
    return [
      {
        'name': 'hello flow',
        'description': '',
        'id': 'flow_1',
        'createdAt': '2018-01-25T09:50:29.664Z',
        'updatedAt': '2018-01-25T09:55:11.088Z'
      },
      {
        'name': 'test flow',
        'description': 'hello',
        'id': 'flow_2',
        'createdAt': '2018-01-25T09:50:29.664Z',
        'updatedAt': '2018-01-25T09:55:11.088Z'
      },
      {
        'name': 'flow something',
        'description': '',
        'id': 'flow_3',
        'createdAt': '2018-01-25T09:50:29.664Z',
        'updatedAt': '2018-01-25T09:55:11.088Z'
      }
    ];
  }
});
