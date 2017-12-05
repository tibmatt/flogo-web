import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';

// import { MonacoLoaderService } from './monaco-loader.service';
import {
  EditorConstructOptions,
  ICursorPositionChangedEvent,
  ICursorSelectionChangedEvent,
  IDisposable,
  IReadOnlyModel,
  IStandaloneCodeEditor,
  LineRange
} from './monaco.types';
import { ClientPosition, CompletionProvider, EditorError, HoverProvider, OffsetRange } from './types';

const SOURCE_ID = 'ngx-monaco-editor';
const LANGUAGE_ID = 'flogomapperscript';
export const DEFAULT_EDITOR_OPTIONS = {
  language: LANGUAGE_ID,
  wordSeparators: '~!@#$%^&*()-=+[{]}|;:\'",<>/?',
  fixedOverflowWidgets: true,
  minimap: {
    enabled: false
  }
};


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'monaco-editor',
  styleUrls: ['monaco-editor.component.css'],
  template: `
    <div #editor class="editor-container" [style.width]="'100%'" [style.height]="'100%'"></div>
    <div class="editor-spinner" *ngIf="isEditorLoading">
      <div class="editor-spinner__indicator">
        <svg viewBox="0 0 64 64">
          <g stroke-width="0">
            <circle cx="24" cy="0" transform="translate(32,32)" r="6.93333">
              <animate attributeName="r" dur="750ms" values="8;7;6;5;4;3;2;1;8" repeatCount="indefinite"></animate>
            </circle>
            <circle cx="16.970562748477143" cy="16.97056274847714" transform="translate(32,32)" r="7.93333">
              <animate attributeName="r" dur="750ms" values="1;8;7;6;5;4;3;2;1" repeatCount="indefinite"></animate>
            </circle>
            <circle cx="1.4695761589768238e-15" cy="24" transform="translate(32,32)" r="1.46666">
              <animate attributeName="r" dur="750ms" values="2;1;8;7;6;5;4;3;2" repeatCount="indefinite"></animate>
            </circle>
            <circle cx="-16.97056274847714" cy="16.970562748477143" transform="translate(32,32)" r="1.93333">
              <animate attributeName="r" dur="750ms" values="3;2;1;8;7;6;5;4;3" repeatCount="indefinite"></animate>
            </circle>
            <circle cx="-24" cy="2.9391523179536475e-15" transform="translate(32,32)" r="2.93333">
              <animate attributeName="r" dur="750ms" values="4;3;2;1;8;7;6;5;4" repeatCount="indefinite"></animate>
            </circle>
            <circle cx="-16.970562748477143" cy="-16.97056274847714" transform="translate(32,32)" r="3.93333">
              <animate attributeName="r" dur="750ms" values="5;4;3;2;1;8;7;6;5" repeatCount="indefinite"></animate>
            </circle>
            <circle cx="-4.408728476930472e-15" cy="-24" transform="translate(32,32)" r="4.93333">
              <animate attributeName="r" dur="750ms" values="6;5;4;3;2;1;8;7;6" repeatCount="indefinite"></animate>
            </circle>
            <circle cx="16.970562748477136" cy="-16.970562748477143" transform="translate(32,32)" r="5.93333">
              <animate attributeName="r" dur="750ms" values="7;6;5;4;3;2;1;8;7" repeatCount="indefinite"></animate>
            </circle>
          </g>
        </svg>
      </div>
    </div>
  `,
})
export class MonacoEditorComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('editor') editorRef: ElementRef;

  @Input() editorOptions: EditorConstructOptions = {};
  @Input() hoverProvider: HoverProvider = null;
  @Input() completionProvider: CompletionProvider = null;

  @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() cursorChange: EventEmitter<ICursorPositionChangedEvent> = new EventEmitter<ICursorPositionChangedEvent>();
  @Output() selectionChange: EventEmitter<ICursorSelectionChangedEvent> = new EventEmitter<ICursorSelectionChangedEvent>();

  @Output() ready: EventEmitter<boolean> = new EventEmitter<boolean>();

  editor: IStandaloneCodeEditor;
  public isEditorLoading: boolean;
  private _disposed = false;
  private _internalHoverProvider = null;
  private _disposables = {
    hoverProvider: <IDisposable>null,
    completionProvider: <IDisposable>null
  };
  private _value = '';

  // constructor(private _monacoLoader: MonacoLoaderService) {
  // }

  get value() {
    return this.editor.getValue();
  }

  @Input()
  set value(val: string) {
    // console.log("Monaco set value: ", val);
    val = val || '';
    this._value = val;
    if (this.editor) {
      this.editor.setValue(val);
    }
  }

  ngOnInit() {
    this.isEditorLoading = true;
  }

  insert(text: string, range?: OffsetRange | LineRange) {
    let monacoRange: monaco.Range = null;
    if (range) {
      monacoRange = this.createMonacoRangeInstance(range);
    } else {
      const { startLineNumber, startColumn, endLineNumber, endColumn } = this.determineRangeToInsertTo();
      monacoRange = new monaco.Range(startLineNumber, startColumn, endLineNumber, endColumn);
    }

    this.insertText(text, monacoRange);
  }

  insertAtClientPosition(text: string, clientPosition: ClientPosition) {
    const target = this.editor.getTargetAtClientPoint(clientPosition.x, clientPosition.y);
    if (target && target.position) {
      const { lineNumber, column } = target.position;
      this.insertText(text, this.createMonacoRangeInstance({
        startLineNumber: lineNumber,
        startColumn: column,
        endLineNumber: lineNumber,
        endColumn: column
      }));
    }
  }

  replaceTokenAtClientPosition(text: string, clientPosition: ClientPosition) {
    const range = this.getRangeForTokenAtClientPosition(clientPosition);
    if (range) {
      this.insertText(text, monaco.Range.lift(range));
    } else {
      this.insert(text);
    }
  }

  selectTokenAtClientPosition(clientPosition: ClientPosition) {
    const range = this.getRangeForTokenAtClientPosition(clientPosition);
    if (!range) {
      return;
    }

    this.editor.setSelection(monaco.Selection.lift(range));
  }

  setCursorAtClientPosition(clientPosition: ClientPosition) {
    const target = this.editor.getTargetAtClientPoint(clientPosition.x, clientPosition.y);
    const newPosition = target ? target.position : null;
    if (newPosition && !newPosition.equals(this.editor.getPosition())) {
      this.editor.setPosition(target.position);
      this.editor.focus();
    }
  }

  changeModel(value: string, mode?: string) {
    if (this._disposed) {
      return;
    }
    this._value = value;
    mode = mode || DEFAULT_EDITOR_OPTIONS.language;

    if (!this.editor) {
      this.editorOptions.language = mode;
      // changes should be taken from _value when editor initializes
      return;
    }

    const currentModel = this.editor.getModel();
    if (currentModel) {
      currentModel.dispose();
    }

    const newModel = monaco.editor.createModel(value, mode);
    this.editor.setModel(newModel);
  }

  hasErrors() {
    if (this._disposed || !this.editor) {
      return false;
    }

    const model = this.editor.getModel();
    if (model) {
      const markers = monaco.editor.getModelMarkers({ owner: SOURCE_ID });
      return Boolean(markers) && markers.find((marker) => marker.severity === monaco.Severity.Error) != null;
    }
    return false;
  }

  setErrors(errors?: EditorError[]) {
    if (this._disposed || !this.editor) {
      return;
    }

    const model = this.editor.getModel();
    if (!model) {
      return;
    }


    const errorMarkers = errors && errors.length ? errors.map((e: EditorError) => this.errorToMarker(e)) : [];
    monaco.editor.setModelMarkers(model, SOURCE_ID, errorMarkers);
  }

  ngAfterViewInit() {
    if (this._disposed) {
      return;
    }
    this.initMonaco();
    // Wait until monaco editor is available
    // this._monacoLoader.load()
    //   .then(() => {
    //     // Need to check if the view has already been destroyed before Monaco was loaded
    //     if (this._disposed) {
    //       return;
    //     }
    //     this.initMonaco();
    //     // return monaco.languages.typescript.getJavaScriptWorker();
    //   });
    // .then(() => {
    //   this._monacoLoader.restoreGlobals();
    // });

  }

  ngOnDestroy() {
    if (this._disposed) {
      return;
    }
    this._disposed = true;

    // Close possibly loaded editor component
    if (this.editor) {
      // this._monacoLoader.restoreGlobals();
      this.editor.dispose();
    }
    this.editor = null;

    Object.keys(this._disposables).forEach(key => {
      const disposable: IDisposable = this._disposables[key];
      if (disposable) {
        disposable.dispose();
      }
    });

    if (this._internalHoverProvider) {
      this._internalHoverProvider.dispose();
    }
    this._internalHoverProvider = null;

  }

  @HostListener('window:resize')
  onWindowResize() {
    this.updateDimensions();
  }

  updateDimensions(dimension?: { width: number, height: number }) {
    if (this.editor) {
      this.editor.layout(dimension);
    }
  }

  private initMonaco() {
    const editorOptions = Object.assign({}, DEFAULT_EDITOR_OPTIONS, this.editorOptions, { value: this._value });
    const languageId = this.getLanguageId();
    // Register a new language
    monaco.languages.register({ id: languageId });

    // Register a tokens provider for the language
    monaco.languages.setMonarchTokensProvider(languageId, this.getGrammar());
    this.registerHoverProvider();
    this.registerCompletionProvider();
    this.editor = monaco.editor.create(this.editorRef.nativeElement, editorOptions);
    // monaco.languages.typescript.javascriptDefaults.setCompilerOptions({ noLib: true, allowNonTsExtensions: true });
    this.editor.onDidChangeModelContent(() => this.onDidChangeContent());
    this.editor.onDidChangeCursorPosition(event => this.onDidChangeCursorPosition(event));
    this.editor.onDidChangeCursorSelection(event => this.onDidChangeCursorSelection(event));

    const didScrollChangeDisposable = this.editor.onDidScrollChange((event) => {
      this.isEditorLoading = false;
      didScrollChangeDisposable.dispose();
      this.ready.next(true);
    });
  }

  private onDidChangeContent() {
    const value: string = this.editor.getModel().getValue();
    this._value = value;
    this.valueChange.next(value);
  }

  private onDidChangeCursorPosition(event: ICursorPositionChangedEvent) {
    const offset = this.editor.getModel().getOffsetAt(event.position);
    this.cursorChange.next(event);
  }

  private onDidChangeCursorSelection(event: ICursorSelectionChangedEvent) {
    const model = this.editor.getModel();

    const startPostion = event.selection.getStartPosition();
    const offsetStart = model.getOffsetAt(startPostion);

    const endPosition = event.selection.getEndPosition();
    const offsetEnd = model.getOffsetAt(endPosition);

    this.selectionChange.next(event);
  }

  private registerHoverProvider() {
    const _provideHover = (model: IReadOnlyModel, position, cancellationToken) => {
      if (!this.hoverProvider) {
        return null;
      }

      const { lineNumber, column } = position;
      const offset = model.getOffsetAt(position);

      // wrapping on Promise.resolve for the case where it doesn't return a promise
      return Promise.resolve(
        this.hoverProvider.provideHover({ lineNumber, column, offset }, cancellationToken)
      ).then(hover => {
        const { contents, range } = hover;
        const monacoRange = this.createMonacoRangeInstance(range);
        return {
          contents,
          range: monacoRange,
        };
      });

    };

    this._disposables.hoverProvider = monaco.languages.registerHoverProvider(this.getLanguageId(), {
      provideHover(model, position, token) {
        return _provideHover(model, position, token);
      }
    });

  }

  private registerCompletionProvider() {

    const _provideCompletion = (model, position, cancellationToken) => {
      if (!this.completionProvider) {
        return [];
      }

      const { lineNumber, column } = position;
      const offset = model.getOffsetAt(position);

      return this.completionProvider.provideCompletionItems({ lineNumber, column, offset }, cancellationToken);
    };

    this._disposables.completionProvider = monaco.languages.registerCompletionItemProvider(this.getLanguageId(), {
      provideCompletionItems(model, position, cancellationToken) {
        return _provideCompletion(model, position, cancellationToken);
      }
    });
  }

  private createMonacoRangeInstance(range: OffsetRange | LineRange) {
    const model = this.editor.getModel();

    if (range && (<OffsetRange>range).endOffset) {
      range = <OffsetRange>range;
      let startLineNumber;
      let startColumn;
      let endLineNumber;
      let endColumn = null;
      const startPosition = model.getPositionAt(range.startOffset);
      const endPosition = model.getPositionAt(range.endOffset);
      startLineNumber = startPosition.lineNumber;
      startColumn = startPosition.column;
      endLineNumber = endPosition.lineNumber;
      endColumn = endPosition.column;
      return new monaco.Range(startLineNumber, startColumn, endLineNumber, endColumn);
    }
    range = <LineRange>range;
    const { startLineNumber, startColumn, endLineNumber, endColumn } = range;
    return new monaco.Range(startLineNumber, startColumn, endLineNumber, endColumn);

  }

  private errorToMarker(e: EditorError) {
    const { startLineNumber, startColumn, endColumn, endLineNumber } = this.createMonacoRangeInstance(e.location);
    return {
      startLineNumber,
      startColumn,
      endLineNumber,
      endColumn,
      severity: monaco.Severity.Error,
      message: e.message,
    };
  }

  private determineRangeToInsertTo(): monaco.IRange {
    const selection = this.editor.getSelection();
    return {
      startLineNumber: selection.selectionStartLineNumber,
      startColumn: selection.selectionStartColumn,
      endLineNumber: selection.positionLineNumber,
      endColumn: selection.positionColumn,
    };
  };

  private getLanguageId() {
    // return this.editor.getModel().getModeId();
    return LANGUAGE_ID;
  }

  private insertText(text: string, range: monaco.Range) {
    this.editor.executeEdits(SOURCE_ID, [{
      text,
      range,
      // todo: what's this exactly?
      identifier: { major: 1, minor: 1 },
      forceMoveMarkers: true,
    }]);
  }

  private getRangeForTokenAtClientPosition(clientPosition: ClientPosition): monaco.IRange | null {
    const target = this.editor.getTargetAtClientPoint(clientPosition.x, clientPosition.y);
    if (!target || !target.position) {
      return null;
    }
    const position = target.position;
    // // default is target position (range of width 0) for the case where target is not a token or editor is empty
    // const range = {
    //   startLineNumber: position.lineNumber,
    //   startColumn: position.column,
    //   endLineNumber: position.lineNumber,
    //   endColumn: position.column
    // };

    const word = this.editor.getModel().getWordAtPosition(position);
    if (word) {
      return {
        startLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endLineNumber: position.lineNumber,
        endColumn: word.endColumn,
      };
    }
    return null;
  }

  private getGrammar(): monaco.languages.IMonarchLanguage {
    /* tslint:disable:quotemark */
    return <any>{
      tokenPostfix: '.js',

      keywords: [
        'true', 'false'
      ],

      builtins: [],

      operators: [],

      // define our own brackets as '<' and '>' do not match in javascript
      brackets: [
        ['(', ')', 'bracket.parenthesis'],
        ['{', '}', 'bracket.curly'],
        ['[', ']', 'bracket.square']
      ],

      // common regular expressions
      symbols: /[~!@#%\^&*-+=|\\:`<>.?\/]+/,
      escapes: /\\(?:[btnfr\\"']|[0-7][0-7]?|[0-3][0-7]{2})/,
      exponent: /[eE][\-+]?[0-9]+/,

      regexpctl: /[(){}\[\]\$\^|\-*+?\.]/,
      regexpesc: /\\(?:[bBdDfnrstvwWn0\\\/]|@regexpctl|c[A-Z]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4})/,

      tokenizer: {
        root: [
          // identifiers and keywords
          [/([a-zA-Z_\$][\w\$]*)(\s*)(:?)/, {
            cases: {
              '$1@keywords': ['keyword', 'white', 'delimiter'],
              '$3': ['key.identifier', 'white', 'delimiter'],   // followed by :
              '$1@builtins': ['predefined.identifier', 'white', 'delimiter'],
              '@default': ['identifier', 'white', 'delimiter']
            }
          }],

          // whitespace
          { include: '@whitespace' },

          // regular expression: ensure it is terminated before beginning (otherwise it is an opeator)
          [/\/(?=([^\\\/]|\\.)+\/)/, { token: 'regexp.slash', bracket: '@open', next: '@regexp' }],

          // delimiters and operators
          [/[{}()\[\]]/, '@brackets'],
          [/[;,.]/, 'delimiter'],
          [/@symbols/, {
            cases: {
              '@operators': 'operator',
              '@default': ''
            }
          }],

          // numbers
          [/\d+\.\d*(@exponent)?/, 'number.float'],
          [/\.\d+(@exponent)?/, 'number.float'],
          [/\d+@exponent/, 'number.float'],
          [/0[xX][\da-fA-F]+/, 'number.hex'],
          [/0[0-7]+/, 'number.octal'],
          [/\d+/, 'number'],

          // strings: recover on non-terminated strings
          [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
          [/'([^'\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
          [/"/, 'string', '@string."'],
          [/'/, 'string', '@string.\''],
        ],

        whitespace: [
          [/[ \t\r\n]+/, 'white'],
          [/\/\*/, 'comment', '@comment'],
          [/\/\/.*$/, 'comment'],
        ],

        comment: [
          [/[^\/*]+/, 'comment'],
          // [/\/\*/, 'comment', '@push' ],    // nested comment not allowed :-(
          [/\/\*/, 'comment.invalid'],
          ["\\*/", 'comment', '@pop'],
          [/[\/*]/, 'comment']
        ],

        string: [
          [/[^\\"']+/, 'string'],
          [/@escapes/, 'string.escape'],
          [/\\./, 'string.escape.invalid'],
          [/["']/, {
            cases: {
              '$#==$S2': { token: 'string', next: '@pop' },
              '@default': 'string'
            }
          }]
        ],

        // We match regular expression quite precisely
        regexp: [
          [/(\{)(\d+(?:,\d*)?)(\})/, ['@brackets.regexp.escape.control', 'regexp.escape.control', '@brackets.regexp.escape.control']],
          [/(\[)(\^?)(?=(?:[^\]\\\/]|\\.)+)/, ['@brackets.regexp.escape.control', {
            token: 'regexp.escape.control',
            next: '@regexrange'
          }]],
          [/(\()(\?:|\?=|\?!)/, ['@brackets.regexp.escape.control', 'regexp.escape.control']],
          [/[()]/, '@brackets.regexp.escape.control'],
          [/@regexpctl/, 'regexp.escape.control'],
          [/[^\\\/]/, 'regexp'],
          [/@regexpesc/, 'regexp.escape'],
          [/\\\./, 'regexp.invalid'],
          ['/', { token: 'regexp.slash', bracket: '@close' }, '@pop'],
        ],

        regexrange: [
          [/-/, 'regexp.escape.control'],
          [/\^/, 'regexp.invalid'],
          [/@regexpesc/, 'regexp.escape'],
          [/[^\]]/, 'regexp'],
          [/\]/, '@brackets.regexp.escape.control', '@pop'],
        ],
      },
    };
  }

  /* tslint:enable:quotemark */
}
