'use strict';

const gulp = require('gulp');  
const sass = require('gulp-sass');  
const version = require('gulp-version-number');
const browserSync = require('browser-sync').create();
const assets = 'src/assets/';
const views = 'src/views/';

const versionConfig = {
    value: '%MDS%',
    append: {
        key: '_v',
        cover: 1,
        to: ['css', 'js', 'ico', 'png', 'jpg', 'svg'],
    },
};

gulp.task('sass', function(done) {  
    gulp.src(assets + 'scss/**/*.scss')
        .pipe(sass({includePaths: [assets + 'scss'], outputStyle: 'compressed'}))
        .on('error', function(error) {
            console.error('\x1b[31m\x1b[1m' + error.messageFormatted + '\x1b[0m');
            done(error); 
        })
        .pipe(gulp.dest(assets + 'css'));
    gulp.src(views + '**/*.hjs')
        .pipe(version(versionConfig))
        .pipe(gulp.dest(views));
    done();
});

gulp.task('serve', gulp.series(['sass'], function() {
    browserSync.init({
        proxy: {
            target: 'localhost:3000'
        },
        baseDir: './',
        open: true,
        notify: false,
        watch: true,
        reloadDebounce: 500
    });

    gulp.watch(assets + 'scss/**/*.scss', gulp.series(['sass']));
    gulp.watch(assets + 'files/**/*').on('change', browserSync.reload);
    gulp.watch(assets + 'css/**/*.css').on('change', browserSync.reload);
    gulp.watch(assets + 'js/**/*.js').on('change', browserSync.reload);
    gulp.watch(views + '**/*.hjs').on('change', browserSync.reload);
    gulp.watch(views + '**/*.html').on('change', browserSync.reload);
}));

gulp.task('default', gulp.series(['serve']));