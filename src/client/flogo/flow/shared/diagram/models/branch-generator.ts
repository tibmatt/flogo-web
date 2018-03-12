
export function genBranchLine(opts?: any): any {
  const spaceBetweenBranches = 73; // fill the space between two branches
  const defaultSize = {
    svgWidth: 92,
    svgHeight: opts.defaultHeight + spaceBetweenBranches
  };
  // default opts
  const svgSize = [
    _.get(opts, 'svgWidth', defaultSize.svgWidth),
    _.get(opts, 'svgHeight', defaultSize.svgHeight)
  ];
  const barWidth = _.get(opts, 'barSize', 26);
  const translate = _.get(opts, 'translate', [2, 2]);

  const SUPPORTED_STATES = ['default', 'hover', 'selected', 'run'];

  /* tslint:disable:max-line-length */
  const DEFAULT_FILTER = `
      <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="filter-1">
          <feOffset dx="0" dy="1" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
          <feGaussianBlur stdDeviation="1" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
          <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.2 0" type="matrix" in="shadowBlurOuter1" result="shadowMatrixOuter1">
          </feColorMatrix>
          <feMerge>
              <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
              <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
      </filter>
    `.trim();
  /* tslint:enable:max-line-length */

  /* tslint:disable:max-line-length */
  const filters = <any>{
    'default': DEFAULT_FILTER,
    'hover': `
      <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="filter-1">
          <feOffset dx="0" dy="1" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
          <feGaussianBlur stdDeviation="1.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
          <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.4 0" in="shadowBlurOuter1" type="matrix" result="shadowMatrixOuter1"></feColorMatrix>
          <feMerge>
              <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
              <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
      </filter>
    `.trim(),
    'selected': `
      <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="filter-1">
          <feOffset dx="0" dy="1" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
          <feGaussianBlur stdDeviation="1.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
          <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.4 0" in="shadowBlurOuter1" type="matrix" result="shadowMatrixOuter1"></feColorMatrix>
          <feMerge>
              <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
              <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
      </filter>
    `.trim(),
    'run': DEFAULT_FILTER
  };
  /* tslint:enable:max-line-length */

  const fills = <any>{
    'default': `
      <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-1">
          <stop stop-color="#ABB0C5" offset="0%"></stop>
          <stop stop-color="#C2C5DA" offset="100%"></stop>
      </linearGradient>
    `.trim(),
    'hover': `
      <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-1">
          <stop stop-color="#ABB0C5" offset="0%"></stop>
          <stop stop-color="#C2C5DA" offset="100%"></stop>
      </linearGradient>
    `.trim(),
    'selected': '',
    'run': ''
  };

  const path = genBranchArrow(
    _.assign({}, opts, {
      svgWidth: svgSize[0],
      svgHeight: svgSize[1],
      barWidth: barWidth,
      translate: translate,
      padding: {
        bottom: 10,
        right: 3
      }
    }));

  const defaultPath = genBranchArrow(
    _.assign({}, opts, {
      svgWidth: defaultSize.svgWidth,
      svgHeight: defaultSize.svgHeight,
      barWidth: barWidth,
      translate: translate,
      padding: {
        bottom: 10,
        right: 3
      }
    }));

  const groups = <any>{
    'default': `
      <g id="branch-1" filter="url(#filter-1)" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"
          transform="translate(${translate[0]}, ${translate[1]})">
          <path d="${defaultPath}" id="Combined-Shape" fill="url(#linearGradient-1)"></path>
      </g>
    `.trim(),
    'hover': `
      <g id="Spec" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(${translate[0]}, ${translate[1]})">
          <g id="Flogo_Branch-Configure-1" fill="url(#linearGradient-1)">
              <g id="branches">
                  <g id="branch-1">
                      <path d="${path}" id="Combined-Shape" filter="url(#filter-1)"></path>
                  </g>
              </g>
          </g>
      </g>
    `.trim(),
    'selected': `
      <g id="Spec" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(${translate[0]}, ${translate[1]})">
          <g id="Flogo_Branch-Configure-1" fill="#8A90AE">
              <g id="branches">
                  <g id="branch-1">
                      <path d="${path}" id="Combined-Shape" filter="url(#filter-1)"></path>
                  </g>
              </g>
          </g>
      </g>
    `.trim(),
    'run': `
      <g id="Spec" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(${translate[0]}, ${translate[1]})">
          <g id="Flogo_Branch-Configure-1" fill="#DEF2FD">
              <g id="branches">
                  <g id="branch-1">
                      <path d="${path}" id="Combined-Shape" filter="url(#filter-1)"></path>
                  </g>
              </g>
          </g>
      </g>
    `.trim()
  };

  const svgWrapper = `
  <svg width="${svgSize[0]}px" height="${svgSize[1]}px" version="1.1"
    xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        ___FILTER___
        ___FILL___
    </defs>
    ___GROUP___
  </svg>
  `.trim();

  const svgWrapperDefault = `
  <svg width="${defaultSize.svgWidth}px" height="${defaultSize.svgHeight}px" version="1.1"
    xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        ___FILTER___
        ___FILL___
    </defs>
    ___GROUP___
  </svg>
  `.trim();

  const branchLines = <any>{};

  _.each(SUPPORTED_STATES, (state: string) => {
    const wrapper = (state === 'default') ? svgWrapperDefault : svgWrapper;
    branchLines[state] = wrapper.replace('___FILTER___', filters[state])
      .replace('___FILL___', fills[state])
      .replace('___GROUP___', groups[state]);
  });

  return branchLines;
}

export function genBranchArrow(opts?: any): string {

  // --- sample path info ---

  // M0,0        // the start point
  // L0,71       // the left vertical boundary

  // // outer curve
  // C0.00407789085,84.2639443 10.7467423,94.999999 24,95

  // L76,95      // the bottom boundary
  // L83,82.5    // the right most point
  // L76,70      // the right point of the middle horizontal line
  // L34,70      // the left point of the middle horizontal line

  // // inner curve
  // C29.9779086,69.6246589 26.4,66.0465096 26,62

  // L26,0       // the top right point of the shape

  // Z

  // default opts
  const svgSize = [
    _.get(opts, 'svgWidth', 87),
    _.get(opts, 'svgHeight', 100)
  ];
  const barWidth = _.get(opts, 'barSize', 26);
  const translateCo = _.get(opts, 'translate', [2, 2]);
  const padding = _.get(opts, 'padding', {
    bottom: 3,
    right: 2
  });

  const imgSize = [
    svgSize[0] - translateCo[0] - padding.right,
    svgSize[1] - translateCo[1] - padding.bottom
  ];

  // the factor to calculate the height of the triangle shape, to the right most point
  const triangleHeightFactor = 7 / 12.5;
  const halfBaseline = barWidth / 2;
  const heightOfTriangle = halfBaseline * triangleHeightFactor;

  // curve bar area related offsets
  const outerCurveFactor = barWidth / 26;
  const curveBarAreaOffset = {
    width: 8 * outerCurveFactor,
    height: 7 * outerCurveFactor,
    outerCurveHeight: 9 * outerCurveFactor,
    outerCurveWdith: 10 * outerCurveFactor,
    outerCurCtrl1X: 0.00407789085 * outerCurveFactor,
    outerCurCtrl1Y: 13.2639443 * outerCurveFactor,
    outerCurCtrl2X: 13.2532577 * outerCurveFactor,
    outerCurCtrl2Y: 9.999999974752427e-7 * outerCurveFactor,
    innerCurCtrl1X: 4.022091400000001 * outerCurveFactor,
    innerCurCtrl1Y: 0.3753411 * outerCurveFactor,
    innerCurCtrl2X: 0.4 * outerCurveFactor,
    innerCurCtrl2Y: 4.0465096 * outerCurveFactor
  };

  const curveBarArea = {
    maxWidth: curveBarAreaOffset.width + barWidth,
    maxHeight: curveBarAreaOffset.height + barWidth
  };

  const width = imgSize[0] - heightOfTriangle - curveBarArea.maxWidth;
  const height = imgSize[1] - curveBarArea.maxHeight;

  const leftLine = {
    start: [0, 0],
    stop: [0, curveBarAreaOffset.outerCurveHeight + height]
  };

  const outerCurve = {
    start: leftLine.stop,
    stop: [
      curveBarArea.maxWidth - curveBarAreaOffset.outerCurveWdith,
      curveBarArea.maxHeight + height
    ],
  };

  const outerCurveControl = {
    control1: [
      outerCurve.start[0] + curveBarAreaOffset.outerCurCtrl1X,
      outerCurve.start[1] + curveBarAreaOffset.outerCurCtrl1Y
    ],
    control2: [
      outerCurve.stop[0] - curveBarAreaOffset.outerCurCtrl2X,
      outerCurve.stop[1] - curveBarAreaOffset.outerCurCtrl2Y
    ]
  };

  const bottomHLine = {
    start: outerCurve.stop,
    stop: [curveBarArea.maxWidth + width, outerCurve.stop[1]]
  };

  const topOfArrow = [
    bottomHLine.stop[0] + heightOfTriangle,
    bottomHLine.stop[1] - halfBaseline
  ];

  const middleHLine = {
    start: [bottomHLine.stop[0], bottomHLine.stop[1] - barWidth],
    stop: [curveBarArea.maxWidth, bottomHLine.stop[1] - barWidth]
  };

  const innerCurve = {
    start: middleHLine.stop,
    stop: [barWidth, height]
  };


  const innerCurveControl = {
    control1: [
      innerCurve.start[0] - curveBarAreaOffset.innerCurCtrl1X,
      innerCurve.start[1] - curveBarAreaOffset.innerCurCtrl1Y
    ],
    control2: [
      innerCurve.stop[0] + curveBarAreaOffset.innerCurCtrl2X,
      innerCurve.stop[1] + curveBarAreaOffset.innerCurCtrl2Y
    ]
  };

  // construct path
  return `M${leftLine.start.join(',')} L${leftLine.stop.join(',')} C${outerCurveControl.control1.join(
    ',')} ${outerCurveControl.control2.join(
    ',')} ${outerCurve.stop.join(',')} L${bottomHLine.stop.join(',')} L${topOfArrow.join(',')} L${middleHLine.start.join(
    ',')} L${middleHLine.stop.join(',')} C${innerCurveControl.control1.join(',')} ${innerCurveControl.control2.join(
    ',')} ${innerCurve.stop.join(',')} L${barWidth},0 Z`;
}
