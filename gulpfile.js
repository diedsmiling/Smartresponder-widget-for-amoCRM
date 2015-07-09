var gulp  = require('gulp'),
    zip   = require('gulp-zip'),
    debug = require('gulp-debug'),
    watch = require('gulp-watch');

gulp.task('zip_widget', function () {
    return gulp.src('*')
        .pipe(debug({title: 'Tracked:'}))
        .pipe(zip('widget.zip'))
        .pipe(gulp.dest(''));
});

gulp.task('watch', function(){
    gulp.watch('*', ['zip_widget'])
});

gulp.task('default', ['watch']);