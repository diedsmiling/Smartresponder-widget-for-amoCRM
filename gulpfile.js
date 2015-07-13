var gulp  = require('gulp'),
    zip   = require('gulp-zip'),
    copy  = require('gulp-copy'),
    debug = require('gulp-debug'),
    watch = require('gulp-watch'),
    clean = require('gulp-clean'),
    buildFiles = ['i18n/**/*', 'images/**/*', 'manifest.json', 'script.js']

/**
 * Deletes widget directory and widget zip file
 */
gulp.task('clean_up', function(){
    return gulp.src(['widget', 'widget.zip'])
        .pipe(debug({title: 'Deleting'}))
        .pipe(clean({force: true}))
});

/**
 * Copies widget files to build directory
 * @depends clean_up task
 */
gulp.task('build_widget', ['clean_up'], function(){
   return gulp.src(buildFiles).pipe(debug({title: 'Copying:'})).pipe(copy('widget'));
});

/**
 *  Zips build directory
 *  @depends build_widget task
 */
gulp.task('zip_widget', ['build_widget'], function () {
    return gulp.src('widget/**/*')
        .pipe(debug({title: 'Zipping:'}))
        .pipe(zip('widget.zip'))
        .pipe(gulp.dest(''));
});

gulp.task('watch', function(){
    gulp.watch(buildFiles, ['zip_widget'])
});

gulp.task('default', ['zip_widget', 'watch']);
