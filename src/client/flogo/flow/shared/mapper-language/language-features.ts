import Uri = monaco.Uri;
import IDisposable = monaco.IDisposable;
import { LexingError, RecognitionException } from 'flogo-mapping-parser';
import { LanguageService } from './language-service';
import { LineRange } from '@flogo/flow/shared/monaco-editor/monaco.types';
import { OffsetRange } from '@flogo/flow/shared/monaco-editor/types';

// --- diagnostics --- ---

export class DiagnosticsAdapter {

  private _disposables: IDisposable[] = [];
  private _listener: { [uri: string]: IDisposable } = Object.create(null);

  constructor(private _languageId: string) {
    const onModelAdd = (model: monaco.editor.IModel): void => {
      const modeId = model.getModeId();
      if (modeId !== this._languageId) {
        return;
      }

      let handle: number;
      this._listener[model.uri.toString()] = model.onDidChangeContent(() => {
        clearTimeout(handle);
        handle = <any> setTimeout(() => this._doValidate(model.uri, modeId), 500);
      });

      this._doValidate(model.uri, modeId);
    };

    const onModelRemoved = (model: monaco.editor.IModel): void => {
      monaco.editor.setModelMarkers(model, this._languageId, []);
      const uriStr = model.uri.toString();
      const listener = this._listener[uriStr];
      if (listener) {
        listener.dispose();
        delete this._listener[uriStr];
      }
    };

    this._disposables.push(monaco.editor.onDidCreateModel(onModelAdd));
    this._disposables.push(monaco.editor.onWillDisposeModel(model => {
      onModelRemoved(model);
      this._resetSchema(model.uri);
    }));
    this._disposables.push(monaco.editor.onDidChangeModelLanguage(event => {
      onModelRemoved(event.model);
      onModelAdd(event.model);
      this._resetSchema(event.model.uri);
    }));

    this._disposables.push({
      dispose: () => {
        Object.keys(this._listener).forEach(key => {
          this._listener[key].dispose();
        });
      }
    });

    monaco.editor.getModels().forEach(onModelAdd);
  }

  public dispose(): void {
    this._disposables.forEach(d => d && d.dispose());
    this._disposables = [];
  }

  private _resetSchema(resource: Uri): void {
    // this._worker().then(worker => {
    //   worker.resetSchema(resource.toString());
    // });
  }

  private _doValidate(resource: Uri, languageId: string): void {
   LanguageService.doValidation(monaco.editor.getModel(resource).getValue()).then(diagnostics => {
     const model = monaco.editor.getModel(resource);
     if (model.getModeId() === languageId) {
       const markers = diagnostics.map(d => toDiagnostics(resource, d));
       monaco.editor.setModelMarkers(model, languageId, markers);
     }
     console.log(diagnostics);
   });

    // this._worker(resource).then(worker => {
    //   return worker.doValidation(resource.toString()).then(diagnostics => {
    //     const markers = diagnostics.map(d => toDiagnostics(resource, d));
    //     const model = monaco.editor.getModel(resource);
    //     if (model.getModeId() === languageId) {
    //       monaco.editor.setModelMarkers(model, languageId, markers);
    //     }
    //   });
    // }).then(undefined, err => {
    //   console.error(err);
    // });
  }
}
//
//
// function toSeverity(lsSeverity: number): monaco.Severity {
//   switch (lsSeverity) {
//     case ls.DiagnosticSeverity.Error: return monaco.Severity.Error;
//     case ls.DiagnosticSeverity.Warning: return monaco.Severity.Warning;
//     case ls.DiagnosticSeverity.Information:
//     case ls.DiagnosticSeverity.Hint:
//     default:
//       return monaco.Severity.Info;
//   }
// }

//
function toDiagnostics(resource: Uri, diagnostic: RecognitionException|LexingError): monaco.editor.IMarkerData {
  if ((<RecognitionException>diagnostic).token) {
    return parseExceptionToMarker(<RecognitionException> diagnostic);
  } else {
    return lexErrorToMarker(resource, <LexingError> diagnostic);
  }
}

function parseExceptionToMarker(exception: RecognitionException) {
  const marker = {
    code: exception.name,
    severity: monaco.Severity.Error,
    message: exception.message,
    startLineNumber: exception.token.startLine,
    startColumn: exception.token.startColumn,
    endLineNumber: exception.token.endLine,
    endColumn: exception.token.endColumn,
  };
  if (isNaN(exception.token.startOffset)) {

  }
  return marker;
}

function lexErrorToMarker(resource: monaco.Uri, lexingError: LexingError) {
  const model = monaco.editor.getModel(resource);
  const startPosition = model.getPositionAt(lexingError.offset);
  const endPosition = model.getPositionAt(lexingError.offset + lexingError.length);
  return {
    severity: monaco.Severity.Error,
    message: lexingError.message,
    startLineNumber: startPosition.lineNumber,
    startColumn: startPosition.column,
    endLineNumber: endPosition.lineNumber,
    endColumn: endPosition.column,
  };
}
