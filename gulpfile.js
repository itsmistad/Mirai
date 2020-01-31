'use strict';

const gulp = require('gulp');  
const sass = require('gulp-sass');  
const cleanCss = require('gulp-clean-css');
const browserSync = require('browser-sync');
const webroot = 'src/webroot/';

gulp.task('sass', function (done) {  
    gulp.src(webroot + 'scss/theme.scss')
        .pipe(sass({includePaths: [webroot + 'scss']}))
        .pipe(gulp.dest(webroot + 'css'));
    done();
});
 
gulp.task('minify-css', () => {
  return gulp.src(webroot + 'css/*.css')
    .pipe(cleanCss({compatibility: 'ie8', debug: true}), (details) => {
        console.log(`${details.name}: ${details.stats.originalSize}`);
        console.log(`${details.name}: ${details.stats.minifiedSize}`);
    })
    .pipe(gulp.dest(webroot + 'css'));
});

gulp.task('browser-sync', function(done) {  
    browserSync.init([webroot + 'css/*.css', 'js/*.js'], {
        server: {
            baseDir: "./"
        }
    });
    done();
});

gulp.task('default', gulp.series(['sass', 'minify-css', 'browser-sync'], function (done) {  
    gulp.watch(webroot + 'scss/*.scss', gulp.series(['sass']));
    done();
}));