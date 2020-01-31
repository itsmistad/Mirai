'use strict';

const gulp = require('gulp');  
const sass = require('gulp-sass');  
const cleanCss = require('gulp-clean-css');
const browserSync = require('browser-sync').create();
const webroot = 'src/webroot/';

gulp.task('sass', function (done) {  
    gulp.src(webroot + 'scss/*.scss')
        .pipe(sass({includePaths: [webroot + 'scss'], outputStyle: 'compressed'}))
        .pipe(gulp.dest(webroot + 'css'))
        .pipe(browserSync.stream());
    done();
});

gulp.task('serve', ['sass'], function() {
    browserSync.init({
        server: "./"
    });

    gulp.watch(webroot + 'scss/*.scss', ['sass']);
    gulp.watch(webroot + 'js/*.js').on('change', browserSync.reload);
    gulp.watch(webroot + '**/*.html').on('change', browserSync.reload);
});

gulp.task('default', gulp.series(['serve']));