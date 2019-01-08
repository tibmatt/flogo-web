import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { Action } from '@flogo-web/client-core';
import { FakeRootLanguageModule } from '@flogo-web/client-core/language/testing';

import { SharedModule as FlogoSharedModule } from '@flogo-web/client/shared';
import { FlowsListComponent } from '@flogo-web/client/flow/shared/flows-list/flows-list.component';

describe('Component: FlowsListComponent', () => {
  let comp: FlowsListComponent;
  let fixture: ComponentFixture<FlowsListComponent>;
  let de: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, FlogoSharedModule, FakeRootLanguageModule],
      declarations: [FlowsListComponent],
    });
    fixture = TestBed.createComponent(FlowsListComponent);
    comp = fixture.componentInstance;
    de = fixture.debugElement;
    comp.list = [];
  });

  it('Should show empty flow message', () => {
    fixture.detectChanges();
    expect(de.queryAll(By.css('.flogo-list__container.--empty')).length).toEqual(1);
  });

  it('Should list 3 applications', () => {
    comp.list = getFlowsList();
    fixture.detectChanges();
    expect(de.queryAll(By.css('.flogo-list__card')).length).toEqual(3);
  });

  it("Should filter 2 applications when filtered by term 'hello'", () => {
    comp.list = getFlowsList();
    comp.searchText = 'Hello';
    fixture.detectChanges();
    expect(de.queryAll(By.css('.flogo-list__card')).length).toEqual(2);
  });

  it('Should form proper link to open a flow in new tab', () => {
    comp.list = getFlowsList();
    fixture.detectChanges();
    const firstLink = de.queryAll(By.css('.flogo-link'))[0].nativeElement;
    expect(firstLink.getAttribute('href')).toEqual('/flows/flow_1');
  });

  it("Should emit selected flow's details", done => {
    comp.list = getFlowsList();
    comp.flowSelected.subscribe(event => {
      expect(event.id).toEqual('flow_1');
      done();
    });
    fixture.detectChanges();
    const firstSelectFlowButton = de.queryAll(
      By.css('.flogo-list__card .flogo-button--secondary')
    )[0].nativeElement;
    firstSelectFlowButton.click();
  });

  function getFlowsList(): Action[] {
    return [
      {
        name: 'hello flow',
        description: '',
        id: 'flow_1',
        createdAt: '2018-01-25T09:50:29.664Z',
        updatedAt: '2018-01-25T09:55:11.088Z',
        tasks: [],
        links: [],
      },
      {
        name: 'test flow',
        description: 'hello',
        id: 'flow_2',
        createdAt: '2018-01-25T09:50:29.664Z',
        updatedAt: '2018-01-25T09:55:11.088Z',
        tasks: [],
        links: [],
      },
      {
        name: 'flow something',
        description: '',
        id: 'flow_3',
        createdAt: '2018-01-25T09:50:29.664Z',
        updatedAt: '2018-01-25T09:55:11.088Z',
        tasks: [],
        links: [],
      },
    ];
  }
});
