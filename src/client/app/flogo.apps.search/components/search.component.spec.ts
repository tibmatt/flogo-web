import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {DebugElement}    from '@angular/core';
import {TranslateModule, TranslateLoader, TranslateStaticLoader} from 'ng2-translate/ng2-translate';
import {Http} from '@angular/http';

import {FlogoApplicationSearch} from './search.component';

describe('FlogoApplicationSearch component', () => {
  let comp: FlogoApplicationSearch, fixture: ComponentFixture<FlogoApplicationSearch>,
    de: DebugElement, el: HTMLElement;

  function compileComponent() {
    return TestBed.compileComponents();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        provide: TranslateLoader,
        useFactory: (http: Http) => new TranslateStaticLoader(http, '/base/dist/public/assets/i18n', '.json'),
        deps: [Http]
      })],
      declarations: [FlogoApplicationSearch] // declare the test component
    });
  });

  it('On key press should emit the changedSearch event', done => {
    compileComponent()
      .then(() => {
        fixture = TestBed.createComponent(FlogoApplicationSearch);
        comp = fixture.componentInstance;

        comp.changedSearch.subscribe(() => {
          done();
        });

        fixture.detectChanges();
        de = fixture.debugElement.query(By.css('input'));
        el = de.nativeElement;
        let event = new Event('keyup');
        el.dispatchEvent(event);
      });
  });

});
