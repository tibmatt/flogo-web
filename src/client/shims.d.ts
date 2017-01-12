import __lodash from 'lodash';
import __d3 from 'd3';
import __moment from 'moment';

declare global {
  const _: typeof __lodash;
  const d3: typeof __d3;
  const moment: typeof __moment;
}
