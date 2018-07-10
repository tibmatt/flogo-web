/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

/*  */
import * as __lodash from 'lodash';
import * as __moment from 'moment';
import * as __jQuery from 'jquery';
import * as postal from 'postal';
import 'monaco-editor/monaco.d';

declare global {
  const _: typeof __lodash;
  const moment: typeof __moment;
}
