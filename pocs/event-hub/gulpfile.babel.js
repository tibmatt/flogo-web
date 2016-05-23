import gulp from 'gulp';
import del from 'del';
import gulpMerge from 'gulp-merge';
import gulpSourcemaps from 'gulp-sourcemaps';
import path from 'path';
import babel from 'gulp-babel';
import _ from 'lodash';
import { C as _c, O as _o } from './_utils/colors';
import through from 'through2';
import webpack from 'webpack-stream';

const PACKAGE = require( './package.json' );

const CONFIG = {
  src: {
    root: 'src'
  },
  prod: {
    root: 'dist',
    es5: 'es5',
    es2015: 'es2015'
  },
  example: {
    root: 'examples',
    entry: 'examples/entry.js',
    output: 'examples/index.js'
  }
};

gulp.task( 'prod:clean', function ( ) {

  return del( [ path.join( CONFIG.prod.root, '**/*' ), CONFIG.prod.root ] )
    .then( ( paths ) => {
      _o.log( `Deleted files [${ _c.highlight( paths.length ) }]: \n${ _formatFiles( paths ) }` );
    } );

} );

gulp.task( 'prod', [ 'prod:clean' ], function ( ) {

  let inFiles = [ path.join( CONFIG.src.root, '**/*.js' ), `!${ path.join( CONFIG.src.root, '**/*.spec.js' ) }` ];
  let es5Results = [ ];
  let es2015Results = [ ];

  // compile the ES2015 based files to ES5, with source map
  let es5Stream = gulp.src( inFiles )
    .pipe( gulpSourcemaps.init( ) )
    .pipe( babel( ) )
    .pipe( gulpSourcemaps.write( '.' ) )
    .pipe( gulp.dest( path.join( CONFIG.prod.root, CONFIG.prod.es5 ) ) )
    .pipe( through.obj( function ( file, enc, callback ) {

      if ( file && file.path ) {
        es5Results.push( file.path )
      }

      this.push( file );

      callback( );
    } ) )
    .on( 'end', ( ) => {
      _o.log( `Generated ${ _c.highlight( 'ES5' ) } files [${ _c.highlight( es5Results.length ) }]: \n${ _formatFiles( es5Results ) }` );
    } );

  // with ES2015 support, simply move all of the source files to the dist folder,
  // excluding the test files.
  let es2015Stream = gulp.src( inFiles )
    .pipe( gulp.dest( path.join( CONFIG.prod.root, CONFIG.prod.es2015 ) ) )
    .pipe( through.obj( function ( file, enc, callback ) {

      if ( file && file.path ) {
        es2015Results.push( file.path )
      }

      this.push( file );

      callback( );
    } ) )
    .on( 'end', ( ) => {
      _o.log( `Generated ${ _c.highlight( 'ES2015' ) } files [${ _c.highlight( es2015Results.length ) }]: \n${ _formatFiles( es2015Results ) }` );
    } );

  return gulpMerge( es5Stream, es2015Stream );

} );

gulp.task( 'example:clean', function ( ) {

  return del( [ CONFIG.example.output, CONFIG.example.output + '.map' ] )
    .then( ( paths ) => {
      _o.log( `Deleted files [${ _c.highlight( paths.length ) }]: \n${ _formatFiles( paths ) }` );
    } );

} );

gulp.task( 'example:build', function ( ) {
  return gulp.src( CONFIG.example.entry )
    .pipe( webpack( {
      devtool: 'source-map',
      output: {
        filename: 'index.js'
      },
      module: {
        loaders: [
          { 'test': /\.js$/, loader: 'babel-loader' }
        ]
      }
    } ) )
    .pipe( gulpSourcemaps.init( { loadMaps: true } ) )
    .pipe( through.obj( function ( file, enc, cb ) {
      // Dont pipe through any source map files as it will be handled
      // by gulp-sourcemaps
      // Ref: https://github.com/shama/webpack-stream
      var isSourceMap = /\.map$/.test( file.path );
      if ( !isSourceMap ) this.push( file );
      cb( );
    } ) )
    .pipe( gulpSourcemaps.write( '.' ) )
    .pipe( gulp.dest( CONFIG.example.root ) );
} );

gulp.task( 'example', [ 'example:clean', 'example:build' ] );

gulp.task( 'clean', [ 'prod:clean', 'example:clean' ] );

gulp.task( 'default', [ 'prod' ] );

function _formatFiles( filePaths ) {
  return '\t' + _( filePaths )
    .map( ( path ) => _c.highlight( path ) )
    .join( '\n\t' );
}
