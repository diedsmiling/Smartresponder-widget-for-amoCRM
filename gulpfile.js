var gulp  = require( "gulp" ),
    zip   = require( "gulp-zip" ),
    copy  = require( "gulp-copy" ),
    debug = require( "gulp-debug" ),
    watch = require( "gulp-watch" ),
    clean = require( "gulp-clean" ),
    sass = require( "gulp-sass" ),
    buildFiles = [ "i18n/**/*", "images/**/*", "manifest.json", "script.js", "main.css" ];

/**
 * Deletes widget directory and widget zip file
 */
gulp.task( "clean_up", function() {
    return gulp.src( [ "widget", "widget.zip" ] )
        .pipe( debug( { title: "Deleting" } ) )
        .pipe( clean( { force: true } ) )
} );

/**
 * Compiles sass
 * @depends sass clean_up
 */
gulp.task( "sass", function() {
    gulp.src( "main.scss" )
        .pipe( sass().on( "error", sass.logError ) )
        .pipe( gulp.dest( "" ) );
} );

/**
 * Copies widget files to build directory
 * @depends clean_up task
 */
gulp.task( "build_widget", [ "clean_up" ], function() {
   return gulp.src( buildFiles )
       .pipe( debug( { title: "Copying:" } ) )
       .pipe( copy( "widget" ) );
} );

/**
 *  Zips build directory
 *  @depends build_widget task
 */
gulp.task( "zip_widget", [ "build_widget" ], function() {
    return gulp.src( "widget/**/*" )
        .pipe( debug( { title: "Zipping:" } ) )
        .pipe( zip( "widget.zip" ) )
        .pipe( gulp.dest( "" ) );
} );

gulp.task( "watch", function() {
    gulp.watch( "main.scss", [ "sass" ] );
    gulp.watch( buildFiles, [ "zip_widget" ] )
} );

gulp.task( "default", [ "watch" ] );
