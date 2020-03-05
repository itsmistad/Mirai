'use strict';

const gulp = require('gulp');  
const sass = require('gulp-sass');  
const revAll = require('gulp-rev-all');
const revReplace = require('gulp-rev-replace');
const browserSync = require('browser-sync').create();
const assets = 'src/assets/';
const distAssets = 'src/dist/';
const views = 'src/views/';
const distViews = 'src/views/';

gulp.task('sass', function(done) {  
    gulp.src(assets + 'scss/**/*.scss')
        .pipe(sass({includePaths: [assets + 'scss'], outputStyle: 'compressed'}))
        .on('error', function(error) {
            console.error('\x1b[31m\x1b[1m' + error.messageFormatted + '\x1b[0m');
            done(error); 
        })
        .pipe(gulp.dest(assets + 'css'));
    done();
});

gulp.task('rev', function() {
    gulp.src(assets + '**/*')
        .pipe(revAll.revision({
            includeFilesInManifest: [
                '.css', '.js', '.ico', '.png', '.jpg', '.svg', '.gif', '.json',
                '.ttf', '.woff', '.eot'
            ]
        }))
        .pipe(gulp.dest(distAssets))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest(distAssets + 'manifest/'));
});

gulp.task('replace', function() {
    return gulp.src(views + '**/*.hjs')
        .pipe(revReplace({manifest: distAssets + 'manifest/rev-manifest.json'}))
        .pipe(gulp.dest(distViews));
});

gulp.task('serve', gulp.series(['sass', 'rev', 'replace'], function() {
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