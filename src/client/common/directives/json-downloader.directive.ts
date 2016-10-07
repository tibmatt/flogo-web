import {Directive, ElementRef, Input} from '@angular/core';

@Directive({
  selector: '[jsonDownloader]',
  host: {
    '(click)': 'onClick()',
  }
})
export class JsonDownloader {
  private _el: HTMLElement;
  private _link: HTMLAnchorElement;

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
          let outputs = [];

          if(result) {
              outputs = (result.constructor == Array) ? result : [result];
          }

          outputs.forEach((output)=> {
              let jsonString = JSON.stringify(output.data);
              let dataString = `data:text/json;charset=utf-8,${encodeURIComponent(jsonString)}`;

              this._link.setAttribute('href', dataString);
              this._link.setAttribute('download', output.fileName || 'flow.json');
              //if download attribute is not supported
              if (!('download' in this._link)) {
                  this._link.setAttribute('target', '_blank');
              }
              document.body.appendChild(this._link);
              this._link.click();
              document.body.removeChild(this._link);
          })



      });
  }

}
