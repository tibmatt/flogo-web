import {Directive, ElementRef, Input} from '@angular/core';

@Directive({
  selector: '[jsonDownloader]',
  host: {
    '(click)': 'onClick()',
  }
})
export class JsonDownloader {
  private _el: HTMLElement;
  private _link : HTMLAnchorElement;

  @Input('jsonDownloader')
  generateObject: () => Promise<any> = () => null;

  constructor(private el: ElementRef) {
    this._el = el.nativeElement;
  }

  ngOnInit() {
    this._link = document.createElement('a');
    this._link.setAttribute('download', 'flow.json');
    this._link.style.display = 'none';
  }

  onClick() {
    this.generateObject()
      .then(result => {
        let jsonString = JSON.stringify(result);
        let dataString = `data:text/json;charset=utf-8,${encodeURIComponent(jsonString)}`;

        this._link.setAttribute('href', dataString);
        this._link.setAttribute('download', 'flow.json');
        this._link.click();

      });
  }

}
