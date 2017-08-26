/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

/*  */
import * as __lodash from 'lodash';
import * as __d3 from 'd3';
import * as __moment from 'moment';
import * as __jQuery from 'jquery';
import * as postal from 'postal';
declare global {
  const _: typeof __lodash;
  const d3: typeof __d3;
  const moment: typeof __moment;
}

