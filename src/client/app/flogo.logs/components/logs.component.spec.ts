import {By} from '@angular/platform-browser';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DebugElement}    from '@angular/core';

import {FlogoLogs} from './logs.component';
import {SearchPipe} from './search.pipe';
import {LogService} from '../../../common/services/log.service';
import {PostService} from '../../../common/services/post.service';


const LOG_LINES = [
  {
   message: 'message 1',
   timestamp: '7:53:17.574 Feb 20, 2017',
   level: 'error'
  },
  {
    message: 'message 2',
    timestamp: '7:53:17.575 Feb 20, 2017',
    level: 'warning'
  }
];

class LogServiceMocked {
  lines = [];
}

describe('Component: FlogoLogs', () => {
  let comp: FlogoLogs, fixture: ComponentFixture<FlogoLogs>;

  beforeEach((done) => {
    TestBed.configureTestingModule({
        imports: [],
        declarations: [FlogoLogs, SearchPipe],
        providers: [
          PostService,
          {provide: LogService, useClass: LogServiceMocked}
        ]
      })
      .compileComponents()
      .then(()=>{
        fixture = TestBed.createComponent(FlogoLogs);
        comp = fixture.componentInstance;
        done();
      });
  });

  it('Should show two log lines', () => {
    comp.logService.lines = LOG_LINES;
    fixture.detectChanges();
    let res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.log-line'));
    expect(res.length).toEqual(2);
  });

  it('Should filter log messages', () => {
    comp.logService.lines = LOG_LINES;
    comp.searchValue = 'message 1';
    fixture.detectChanges();
    let res: Array<DebugElement> = fixture.debugElement.queryAll(By.css('.log-line'));
    expect(res.length).toEqual(1);
  });

});
