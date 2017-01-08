import rollup      from 'rollup'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs    from 'rollup-plugin-commonjs';
import uglify      from 'rollup-plugin-uglify'

export default {
  entry: './.tmp/compiled/main.aot.js',
  dest: '.tmp/dist/build.js', // output a single application bundle
  sourceMap: false,
  format: 'iife',
  plugins: [
      nodeResolve({jsnext: true, module: true}),
      commonjs({
        include: 'node_modules/**',
        // include: [
        //   'node_modules/rxjs/**',
        //   'node_modules/ng2-bs3-modal/ng2-bs2-modal.js'
        // ],
        namedExports: {
          // left-hand side can be an absolute path, a path
          // relative to the current directory, or the name
          // of a module in node_modules
          'node_modules/ng2-bs3-modal/ng2-bs3-modal.js': [ 'ModalComponent' ],
        }
      }),
      uglify()
  ]
}
