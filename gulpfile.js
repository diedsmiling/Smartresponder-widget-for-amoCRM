var gulp = require('gulp');
var zip = require('gulp-zip');
var debug = require('gulp-debug')

gulp.task('default', function () {
    return gulp.src('*')
        .pipe(debug({title: 'unicorn:'}))
        .pipe(zip('widget.zip'))
        .pipe(gulp.dest(''));
});