'use strict';

const gulp = require('gulp');  
const sass = require('gulp-sass');  
const revAll = require('gulp-rev-all');
const revRewrite = require('gulp-rev-rewrite');
const browserSync = require('browser-sync').create();
const config = require('./config/config');
const assets = 'src/assets/';
const distAssets = 'src/dist/assets/';
const views = 'src/views/';
const distViews = 'src/dist/views/';

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

gulp.task('rev', function(done) {
    gulp.src(assets + '**/*')
        .pipe(revAll.revision({
            includeFilesInManifest: [
                '.css', '.js', '.ico', '.png', '.jpg', '.svg', '.gif', '.json',
                '.ttf', '.woff', '.eot'
            ],
            dontRenameFile: [/^\/favicon.ico$/g]
        }))
        .on('error', function(error) {
            console.error('\x1b[31m\x1b[1m' + error + '\x1b[0m');
            done(error); 
        })
        .pipe(gulp.dest(distAssets))
        .pipe(revAll.manifestFile())
        .on('error', function(error) {
            console.error('\x1b[31m\x1b[1m' + error + '\x1b[0m');
            done(error); 
        })
        .pipe(gulp.dest('src/dist/manifest'))
        .on('end', () => {
            done();
        });
});

gulp.task('rewrite', function(done) {
    gulp.src(views + '**/*.hjs')
        .pipe(revRewrite({manifest: gulp.src('src/dist/manifest/rev-manifest.json') }))
        .on('error', function(error) {
            console.error('\x1b[31m\x1b[1m' + error + '\x1b[0m');
            done(error); 
        })
        .pipe(gulp.dest(distViews))
        .on('end', () => {
            done();
        });
});

gulp.task('serve', gulp.series(['sass', 'rev', 'rewrite'], function() {
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

    gulp.watch(assets + 'scss/**/*.scss', gulp.series(['sass', 'rev', 'rewrite']));
    gulp.watch(assets + 'files/**/*').on('change', browserSync.reload);
    gulp.watch(assets + 'css/**/*.css').on('change', browserSync.reload);
    gulp.watch(assets + 'js/**/*.js').on('change', browserSync.reload);
    gulp.watch(views + '**/*.hjs').on('change', browserSync.reload);
    gulp.watch(views + '**/*.html').on('change', browserSync.reload);
}));

if (config.application.environment === 'local') {
    if (!process.env.SKIP_BROWSER_SYNC) {
        gulp.task('default', gulp.series(['serve']));
    } else {
        gulp.task('default', gulp.series(['sass', 'rev', 'rewrite']));
    }
}
else if (config.application.environment === 'prod')
    gulp.task('default', gulp.series(['rev', 'rewrite']));