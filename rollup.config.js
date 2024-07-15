import json from '@rollup/plugin-json';

export default {
  input: 'dist/esm/index.js',
  output: {
    file: 'dist/common/index.cjs',
    format: 'cjs'
  },
  onwarn: function(warning, handler) {
    // should intercept ... but doesn't in some rollup versions
    if ( warning.code === 'THIS_IS_UNDEFINED' ) { return; }

    // console.warn everything else
    handler( warning );
  },
  plugins: [json()],
};